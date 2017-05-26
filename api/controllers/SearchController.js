/**
 * SearchController
 *
 * @description :: Server-side logic for managing Searches
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */
var spAuth = require('spo-auth'),
  https = require('https'),
  fs = require("fs"),
   _ = require('lodash');
module.exports = {

  index: function(req, res) {
    res.view('search', {
      'searchresult': false
    });
  },
  search: function(req, res) {
    var config = {
      host: "deloitte440.sharepoint.com",
      login: "pdusari@deloitte440.onmicrosoft.com",
      password: "Srirama@440"
    };
    //console.log("req",req.param('search'));
    var params=encodeURIComponent(req.param('search'));
    spAuth.getRequestDigest(config, function(err, data) {
      //console.log(data);
      var search = "'"+params+"'";
      var requestOptions = {
        host: data.host,
        path: '/_api/search/query?querytext=' + search,
        headers: {
          'Accept': 'application/json;odata=verbose',
          'Content-type': 'application/json;odata=verbose',
          'Cookie': 'FedAuth=' + data.FedAuth + '; rtFa=' + data.rtFa,
          'X-RequestDigest': data.digest
        }
      };

      var request = https.request(requestOptions, function(response) {
        var resp = '';
        response.setEncoding('utf8');
        response.on('data', function(chunk) {
          resp += chunk;
        });

        response.on('error', function(err) {
          console.log(err);
        })

        response.on('end', function() {
          //.query.PrimaryQueryResult.RelevantResults.Table.Rows.results[0].Cells
          var result=JSON.parse(resp);
          console.log("testing",(result.d.query.PrimaryQueryResult.RelevantResults.Table.Rows.results).length);
          if((result.d.query.PrimaryQueryResult.RelevantResults.Table.Rows.results).length > 0) {
          var resultdata=result.d.query.PrimaryQueryResult.RelevantResults.Table.Rows.results[0].Cells.results;
          //console.log("resultdata type",resultdata);
          //console.log("resultdata",resultdata);
          var highlight=_.filter(resultdata, ['Key','HitHighlightedSummary']);
          var highlightvalue=(highlight[0].Value).replace("<c0>", "<span style='color:red'>").replace("</c0>","</span>");
          var path=_.filter(resultdata, ['Key','Path'])[0].Value;
          var docfile=path.split('/');
          //console.log("docfile",docfile);
          var fullpath=docfile[4];
          var preview=_.filter(resultdata, ['Key','ServerRedirectedPreviewURL'])[0].Value;
          //console.log("path",preview);
          searchtext=true;
        }else{
          searchtext=false;
        }
          res.view('search', {
            'searchresult': true,
            'searchtext':searchtext,
            'Highlight':highlightvalue,
            'Path':fullpath,
            'Preview':preview
          });
          //res.json(resultdata);
        });
      });
      request.end('');
    });
  },
  upload: function(req, res) {
    res.view('uploadfile',{
      file:false
    });
  },
  uploadfile: function(req, res) {

    var uploadFile = req.file('uploadFile');

    uploadFile.upload({dirname:require('path').resolve(sails.config.appPath, 'documents') }, function onUploadComplete(err, files) {
    // Earlier it was ./assets/images .. Changed to ../../assets/images
    //	Files will be uploaded to ./assets/images
    // Access it via localhost:1337/images/file-name

    if (err) return res.serverError(err);
    //	IF ERROR Return and send 500 error

    console.log(files);

    console.log("files",files[0].fd.split('.tmp'));
    var location=files[0].fd.split('.tmp')[1];
    var spsave = require("spsave").spsave;
    var config = {
      host: "deloitte440.sharepoint.com",
      login: "pdusari@deloitte440.onmicrosoft.com",
      password: "Srirama@440"
    };

    var coreOptions = {
      siteUrl: 'https://deloitte440.sharepoint.com'
    };
    var creds = {
      username: 'pdusari@deloitte440.onmicrosoft.com',
      password: 'Srirama@440'
    };
    var filepath=require('path').resolve(sails.config.appPath, 'documents');
    var fullpath=filepath+files[0].filename;
    var fileOptions = {
      folder: 'Shared%20Documents',
      fileName: files[0].filename,
      fileContent: fs.readFileSync(files[0].fd)
    };
    spsave(coreOptions, creds, fileOptions)
      .then(function() {
        console.log('saved');
        res.view('uploadfile',{file: files });
      })
      .catch(function(err) {
        console.log(err);
      });

});


  }
};

function simpleStringify(object) {
  var simpleObject = {};
  for (var prop in object) {
    if (!object.hasOwnProperty(prop)) {
      continue;
    }
    if (typeof(object[prop]) == 'object') {
      continue;
    }
    if (typeof(object[prop]) == 'function') {
      continue;
    }
    simpleObject[prop] = object[prop];
  }
  return JSON.stringify(simpleObject); // returns cleaned up JSON
};
