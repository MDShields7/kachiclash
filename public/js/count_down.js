(function () {
const countDown = document.getElementById('basho-count-down');
if (countDown) {
    const startTimestamp = parseInt(countDown.dataset.startDate);
    const timeSpan = document.getElementById('basho-count-down-time');

    const updateTimeRemaining = function () {
        const remaining = (startTimestamp - Date.now()) / 1000;
        const seconds = Math.floor(remaining % 60);
        const minutes = Math.floor(remaining / 60) % 60;
        const hours = Math.floor(remaining / 60 / 60) % 24;
        const days = Math.floor(remaining / 60 / 60 / 24);
        let str = "";

        if (days > 1) str += days + " days ";
        else if (days > 0) str += "1 day ";

        if (hours > 1) str += hours + " hours ";
        else if (hours === 1) str += "1 hour ";
        else if (days > 0) str += "0 hours ";

        if (minutes > 1) str += minutes + " minutes ";
        else if (minutes === 1) str += "1 minute ";
        else if (hours > 0) str += "0 minutes ";

        if (seconds > 1) str += seconds + " seconds ";
        else if (seconds === 1) str += "1 second ";
        else if (minutes > 0) str += "0 seconds ";

        timeSpan.innerText = str.trim();
    };
    
    updateTimeRemaining();
    setInterval(updateTimeRemaining, 1000);
}

const DATETIME_FORMAT = new Intl.DateTimeFormat(undefined, {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: 'numeric',
    minute: 'numeric',
    timeZoneName: 'short',
});
document.querySelectorAll('.js-local-datetime').forEach(el => {
    const timestamp = parseInt(el.dataset.timestamp);
    if (timestamp && !isNaN(timestamp)) {
        const date = new Date(timestamp);
        el.innerText = DATETIME_FORMAT.format(date);
    }
});
})();