var p1 = new Promise(
    // The resolver function is called with the ability to resolve or
    // reject the promise
    function(resolve, reject) {
        log.insertAdjacentHTML('beforeend', thisPromiseCount +
            ') Promise started (<small>Async code started</small>)<br/>');
        // This is only an example to create asynchronism
        window.setTimeout(
            function() {
                // We fulfill the promise !
                resolve(thisPromiseCount);
            }, Math.random() * 2000 + 1000);
    }
);
