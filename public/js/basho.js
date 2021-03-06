'use strict';

const banzukeSection = document.getElementById('banzuke');

document.querySelectorAll('.select-radio').forEach(radio => {
    radio.addEventListener('change', event => {
        document.getElementsByName(radio.name).forEach(otherRadio => {
            otherRadio.closest('td').classList.toggle('is-player-pick', otherRadio === radio);
        });
        //savePicks();
    });
});

document.querySelectorAll('.save-picks-button').forEach(button => {
    button.addEventListener('click', event => {
        savePicks();
        setSelectable(false);

    });
});
document.querySelectorAll('.change-picks-button').forEach(button => {
    button.addEventListener('click', event => {
        setSelectable(true);
    });
});

function setSelectable(selectable) {
    banzukeSection.classList.toggle('selectable', selectable);
    document.querySelectorAll('.select-radio').forEach(button => button.disabled = !selectable);
}

function savePicks() {
    const form = document.getElementById('banzuke-select-rikishi-form');
    const data = new URLSearchParams(new FormData(form));
    const url = form.action;
    return fetch(url, {
        method: 'POST',
        body: data,
        credentials: 'same-origin',
    })
    .then(response => {
        if (response.ok) {
            alert("Your picks have been saved!");
            location.reload();
        } else {
            response.text().then(text => {
                alert("Error saving your picks: " + text);
                setSelectable(true);
            });
        }
    });
}

document.querySelectorAll('.bestow-emperors-cup-button').forEach(button => {
    button.addEventListener('click', () => postCup(button, true));
});
document.querySelectorAll('.revoke-emperors-cup-button').forEach(button => {
    button.addEventListener('click', () => postCup(button, false));
});

function postCup(button, bestow) {
    const data = {
        player_id: parseInt(button.dataset.playerId)
    };
    const url = location.href + '/' + (bestow ? 'bestow' : 'revoke') + '_emperors_cup';
    return fetch(url, {
        method: 'POST',
        body: JSON.stringify(data),
        headers: new Headers({
            'Content-Type': 'application/json'
        }),
        credentials: 'same-origin',
    })
    .then(response => {
        if (response.ok) {
            alert("Emperor's Cup has been " + (bestow ? "bestowed" : "revoked"));
        } else {
            response.text().then(text => alert("error: " + text));
        }
    });
}
