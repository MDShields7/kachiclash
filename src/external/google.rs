use url::Url;
use oauth2::{RedirectUrl, TokenUrl, ClientId, ClientSecret, AuthUrl};
use oauth2::basic::{BasicClient};
use rusqlite::{Transaction, Error};
use chrono::{Utc, DateTime};

use crate::Config;
use crate::data::{PlayerId};
use super::AuthProvider;
use crate::external::UserInfo;


pub struct GoogleAuthProvider;

impl AuthProvider for GoogleAuthProvider {
    type UserInfo = GoogleUserInfo;
    const SCOPES: &'static [&'static str] = &["https://www.googleapis.com/auth/userinfo.profile"];
    const USER_INFO_URL: &'static str = "https://www.googleapis.com/userinfo/v2/me";

    fn make_oauth_client(&self, config: &Config) -> BasicClient {
        let mut redirect_url = config.url();
        redirect_url.set_path("login/google_redirect");

        BasicClient::new(
            ClientId::new(config.google_client_id.to_owned()),
            Some(ClientSecret::new(config.google_client_secret.to_owned())),
            AuthUrl::new(Url::parse("https://accounts.google.com/o/oauth2/v2/auth").unwrap()),
            Some(TokenUrl::new(Url::parse("https://oauth2.googleapis.com/token").unwrap()))
        )
        .set_redirect_url(RedirectUrl::new(redirect_url))
    }
}

#[derive(Debug, Deserialize, Clone)]
pub struct GoogleUserInfo {
    pub id: String,
    pub name: Option<String>,
    pub picture: Option<String>, // url
}

impl UserInfo for GoogleUserInfo {
    fn update_existing_player(&self, txn: &Transaction, mod_date: DateTime<Utc>)
        -> Result<Option<PlayerId>, Error> {

        match txn
            .prepare("SELECT player_id, name, picture FROM player_google WHERE id = ?")?
            .query_map(
                params![self.id],
                |row| -> Result<(PlayerId, Option<String>, Option<String>), _> {
                    Ok((row.get("player_id")?,
                        row.get("name")?,
                        row.get("picture")?,
                    ))
                }
            )?
            .next() {

            None => Ok(None),
            Some(Ok((player_id, name, picture))) => {
                if name != self.name || picture != self.picture {
                    txn.execute("
                            UPDATE player_google
                            SET name = ?, picture = ?, mod_date = ?
                            WHERE user_id = ?
                        ",
                                params![self.name, self.picture, mod_date, self.id])?;
                }
                Ok(Some(player_id))
            },
            Some(Err(e)) => Err(e),
        }

    }

    fn insert_into_db(&self, txn: &Transaction, mod_date: DateTime<Utc>, player_id: PlayerId)
        -> Result<usize, rusqlite::Error> {
        txn.execute("
            INSERT INTO player_google (player_id, id, name, picture, mod_date)
            VALUES (?, ?, ?, ?, ?)",
        params![player_id, self.id, self.name, self.picture, mod_date])
    }

    fn name_suggestion(&self) -> String {
        self.name.as_ref()
            .map_or_else(
                || self.anon_name_suggestion(),
                |name| name.to_lowercase().replace(" ", "")
            )
    }
}