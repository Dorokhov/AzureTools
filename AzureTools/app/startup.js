chrome.app.runtime.onLaunched.addListener(function () {
    chrome.app.window.create('index.html', {
        'bounds': {
            'width': 900,
            'height': 500
        }
    }, function (appWin) {
        var pageWindow = appWin.contentWindow;
        var pageDocument = pageWindow.document;
        window = pageWindow;
        global.document = pageDocument;

        pageWindow.addEventListener('load', function () {
           // proceed();
        }, false);
    });
});