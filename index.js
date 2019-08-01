// # SimpleServer
// A simple chat bot server
//const ACCESS_TOKEN = process.env.PAGE_ACCESS_TOKEN;
//const ACCESS_TOKEN = "test";
//const VERIFY_TOKEN = process.env.VERIFICATION_TOKEN;
//const VERIFY_TOKEN = 'test';

var logger = require('morgan');
var http = require('http');
var bodyParser = require('body-parser');
var express = require('express');
var request = require('request');
var router = express();
var app = express();
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
    extended: false
}));
var server = http.createServer(app);
app.listen(process.env.PORT || 3000);
app.get('/', (req, res) => {
    res.send("Server okay!");
});
app.get('/webhook', function (req, res) {
    if (req.query['hub.verify_token'] === 'test') {
        res.send(req.query['hub.challenge']);
    }
    res.send('Error, wrong validation token');
});
// Đoạn code xử lý khi có người nhắn tin cho bot
app.post('/webhook', function (req, res) {
    var entries = req.body.entry;
    for (var entry of entries) {
        var messaging = entry.messaging;
        for (var message of messaging) {
            var senderId = message.sender.id;
            if (message.message) {
                // Nếu người dùng gửi tin nhắn đến
                if (message.message.text) {
                    var text = message.message.text;
                    if (text == "chatbot") {
                        sendMessage(senderId, "Chào bạn, đây là chức năng chatbot (betatest) của nhóm BKUFC-THPT Đức Hòa.");
                    } else {

                    }
                }
            }
        }
    }
    res.status(200).send("OK");
});
// Gửi thông tin tới REST API để Bot tự trả lời
function sendMessage(senderId, message) {
    request({
        url: 'https://graph.facebook.com/v2.6/me/messages',
        qs: {
            access_token: "test",
        },
        method: 'POST',
        json: {
            recipient: {
                id: senderId
            },
            message: {
                text: message
            },
        }
    });
}