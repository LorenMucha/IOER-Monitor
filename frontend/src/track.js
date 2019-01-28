$(function(){
    //Tracking
    if(!window.location.href.includes("monitor_test")) {
        var script_google = `<!-- Global site tag (gtag.js) - Google Analytics -->
                                <script async src="https://www.googletagmanager.com/gtag/js?id=UA-112688592-1"></script>
                                <script>
                                  window.dataLayer = window.dataLayer || [];
                                  function gtag(){dataLayer.push(arguments);}
                                  gtag('js', new Date());
                                  gtag('config', 'UA-112688592-1');
                                </script>
                                `;
        var script_matamo = `<script type="text/javascript">
                            var _paq = _paq || [];
                            _paq.push(['trackPageView']);
                            _paq.push(['enableLinkTracking']);
                            (function() {
                            var u="https://www.ioer.de/stats/";
                            _paq.push(['setTrackerUrl', u+'piwik.php']);
                            _paq.push(['setSiteId', '4']);
                            var d=document, g=d.createElement('script'), s=d.getElementsByTagName('script')[0];
                            g.type='text/javascript'; g.async=true; g.defer=true; g.src=u+'piwik.js'; s.parentNode.insertBefore(g,s);
                            })();
                        </script>`;

        $('head').append(script_google,script_matamo);
    }
});