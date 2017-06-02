module.exports = function (context, req, res) {
  var parser = require('rss-parser');

  var urlsToParse = ["https://remoteok.io/remote-jobs.rss", "https://weworkremotely.com/categories/2-programming/jobs.rss", "https://stackoverflow.com/jobs/feed?l=Remote&d=20&u=Miles"];
  var parsedUrls = [];
  var now = new Date();
  var items = [];

  for (var i = urlsToParse.length - 1; i >= 0; i--) {
    var url = urlsToParse[i];
    parser.parseURL(url, parseCallback);
  }

  function parseCallback(err, parsed) {
    parsed.feed.entries.forEach(function(entry) {
      publicationDate = new Date(entry.pubDate);

      if (publicationDate.toDateString() == now.toDateString()) {
        items.push({title: entry.title.trim(), link: entry.link.trim(), content: entry.content.trim()});
      }
    })
    parsedUrls.push(parsed["feed"]["title"]);
    if (parsedUrls.length == urlsToParse.length) 
    {
      var html = sendEmail(items);
      res.writeHead(200, { 'Content-Type': 'text/html '});
      res.end(html);
    }
    
  }    

  
  function sendEmail(items) {
    var api_key = context.secrets.mg_api_key;
    var domain = 'mg.veverka.net';
    var mailgun = require('mailgun-js')({apiKey: api_key, domain: domain});
     
    var html_body = "<html><head><title></title></head><body>";

    for (var i = items.length - 1; i >= 0; i--) {
      var entry = items[i];
      html_body += "<h2><a href='" + entry.link + "'>" + entry.title + "</a></h2><br />" + entry.content + "<br /><a href='" + entry.link + "'>" + entry.link + "</a><hr />";
    }

    html_body += "</ul></body></html>";

    var data = {
      from: 'Remote Jobber<remotejobber@mg.veverka.net>',
      to: 'patrick@veverka.net',
      subject: 'Remote Jobs For ' + now.toDateString(),
      html: html_body
    };
     
    mailgun.messages().send(data, function (error, body) {
      console.log(body);
    });    
    return html_body;
  }

};