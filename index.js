'use strict';
const PAGE_ACCESS_TOKEN = process.env.PAGE_ACCESS_TOKEN;
const VERIFY_TOKEN = process.env.VERIFY_TOKEN;
const
  request = require('request'),
  express = require('express'),
  body_parser = require('body-parser'),
  app = express().use(body_parser.json());

app.listen(process.env.PORT || 1337, () => console.log('webhook is listening'));

app.post('/webhook', (req, res) => {

  let body = req.body;

  if (body.object === 'page') {

    body.entry.forEach(function (entry) {

      let webhook_event = entry.messaging[0];
      console.log(webhook_event);


      let sender_psid = webhook_event.sender.id;
      console.log('Sender ID: ' + sender_psid);

      if (webhook_event.message) {
        handleMessage(sender_psid, webhook_event.message);
      } else if (webhook_event.postback) {

        handlePostback(sender_psid, webhook_event.postback);
      }

    });
    res.status(200).send('EVENT_RECEIVED');

  } else {
    res.sendStatus(404);
  }

});

app.get('/webhook', (req, res) => {

  let mode = req.query['hub.mode'];
  let token = req.query['hub.verify_token'];
  let challenge = req.query['hub.challenge'];

  if (mode && token) {

    if (mode === 'subscribe' && token === VERIFY_TOKEN) {

      console.log('WEBHOOK_VERIFIED');
      res.status(200).send(challenge);

    } else {
      res.sendStatus(403);
    }
  }
});

function handleMessage(sender_psid, received_message) {
  let response;

  if (received_message.text) {
    response = {
      "text": `Bạn đã gửi: "${received_message.text}" cho chúng tôi. Hiện tại chatbot đang được phát triển, chưa có chức năng phản hồi!`
    };
  }
  callSendAPI(sender_psid, response);
}

function handlePostback(sender_psid, received_postback) {
  console.log('ok');
  let response;
  let payload = received_postback.payload;
  if (payload === 'ViNiX') {
    response = {
      "attachment": {
        "type": "template",
        "payload": {
          "template_type": "generic",
          "elements": [{
            "title": "Chọn chức năng",
            "subtitle": "Chọn một chức năng để bot trả lời cho bạn",
            "buttons": [{
                "type": "postback",
                "title": "Thông tin về kỳ thi THPT Quốc gia",
                "payload": "info_thptqg"
              },
              {
                "type": "postback",
                "title": "Thông tin về kỳ thi Đánh giá năng lực",
                "payload": "info_dgnl"
              },
              {
                "type": "postback",
                "title": "Thông tin về ViNiX bot",
                "payload": "info_vinix"
              }
            ],
          }]
        }
      }
    };
  } else if (payload === 'info_thptqg') {
    response = {
      "attachment": {
        "type": "template",
        "payload": {
          "template_type": "button",
          "text": "Thông tin về kỳ thi THPT Quốc gia được chúng mình tổng hợp ở link sau:",
          "buttons": [{
            "type": "web_url",
            "url": "https://www.messenger.com/",
            "title": "THPTQG",
            "webview_height_ratio": "full"
          }]
        }
      }
    };
  } else if (payload === 'info_dgnl') {
    response = {
      "attachment": {
        "type": "template",
        "payload": {
          "template_type": "button",
          "text": "Thông tin về kỳ thi Đánh giá năng lực được chúng mình tổng hợp ở link sau:",
          "buttons": [{
            "type": "web_url",
            "url": "https://www.messenger.com/",
            "title": "Đánh giá năng lực",
            "webview_height_ratio": "full"
          }]
        }
      }
    };
  } else if (payload === 'info_vinix') {
    response = {
      "attachment": {
        "type": "template",
        "payload": {
          "template_type": "button",
          "text": "ViNiX được phát triển bởi nhóm BKUFC-THPT Đức Hòa, tham khảo thêm tại link sau:",
          "buttons": [{
            "type": "web_url",
            "url": "https://github.com/tien99",
            "title": "GitHub",
            "webview_height_ratio": "full"
          }]
        }
      }
    }
  }
  callSendAPI(sender_psid, response);
}

function callSendAPI(sender_psid, response) {
  let request_body = {
    "recipient": {
      "id": sender_psid
    },
    "message": response
  }

  request({
    "uri": "https://graph.facebook.com/v2.6/me/messages",
    "qs": {
      "access_token": PAGE_ACCESS_TOKEN
    },
    "method": "POST",
    "json": request_body
  }, (err, res, body) => {
    if (!err) {
      console.log('message sent!');
    } else {
      console.error("Unable to send message:" + err);
    }
  });
}

function menu() {
  console.log('menu');
  request({
    "uri": "https://graph.facebook.com/v3.2/me/messenger_profile",
    "qs": {
      "access_token": PAGE_ACCESS_TOKEN
    },
    "method": "POST",
    "json": {
      "persistent_menu": [{
        "locale": "default",
        "composer_input_disabled": false,
        "call_to_actions": [{
            "type": "postback",
            "title": "Kỳ thi THPT Quốc gia",
            "payload": "info_thptqg"
          },
          {
            "type": "postback",
            "title": "Kỳ thi Đánh giá năng lực",
            "payload": "info_dgnl"
          },
          {
            "type": "postback",
            "title": "Thông tin về ViNiX bot",
            "payload": "info_vinix"
          }
        ]
      }]
    }
  }, (err, res, body) => {
    if (!err) {
      console.log('message sent!');
    } else {
      console.error("Unable to send message:" + err);
    }
  });
}

function start() {
  console.log('start');
  request({
    "uri": "https://graph.facebook.com/v3.2/me/messenger_profile",
    "qs": {
      "access_token": PAGE_ACCESS_TOKEN
    },
    "method": "POST",
    "json": {
      "get_started": {
        "payload": "ViNiX"
      }
    }
  }, (err, res, body) => {
    if (!err) {
      console.log('message sent!');
    } else {
      console.error("Unable to send message:" + err);
    }
  });
}

start();
menu();