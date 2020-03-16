'use strict';
const PAGE_ACCESS_TOKEN = process.env.PAGE_ACCESS_TOKEN;
const VERIFY_TOKEN = process.env.VERIFY_TOKEN;
const
  request = require('request'),
  express = require('express'),
  body_parser = require('body-parser'),
  app = express().use(body_parser.json());

const math = [
  {
    "q": {
      "attachment": {
        "type": "template",
        "payload": {
          "template_type": "button",
          "text": "0 + 1 = ?",
          "buttons": [
            {
              "type": "postback",
              "title": "1",
              "payload": "Math_0_A"
            },
            {
              "type": "postback",
              "title": "2",
              "payload": "Math_0_B"
            },
            {
              "type": "postback",
              "title": "3",
              "payload": "Math_0_C"
            }
          ]
        }
      }
    },
    "a": "A"
  },
  {
    "q": {
      "attachment": {
        "type": "template",
        "payload": {
          "template_type": "button",
          "text": "1 + 1 = ?",
          "buttons": [
            {
              "type": "postback",
              "title": "1",
              "payload": "Math_1_A"
            },
            {
              "type": "postback",
              "title": "2",
              "payload": "Math_1_B"
            },
            {
              "type": "postback",
              "title": "3",
              "payload": "Math_1_C"
            }
          ]
        }
      }
    },
    "a": "B"
  },
  {
    "q": {
      "attachment": {
        "type": "template",
        "payload": {
          "template_type": "button",
          "text": "1 + 2 = ?",
          "buttons": [
            {
              "type": "postback",
              "title": "1",
              "payload": "Math_2_A"
            },
            {
              "type": "postback",
              "title": "2",
              "payload": "Math_2_B"
            },
            {
              "type": "postback",
              "title": "3",
              "payload": "Math_2_C"
            }
          ]
        }
      }
    },
    "a": "C"
  }
];

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
    console.log($received_message.text);
    // response = {
    //   "text": `Bạn đã gửi: "${received_message.text}" cho chúng tôi. Hiện tại chatbot đang được phát triển, chưa có chức năng phản hồi!`
    // };
  }
  callSendAPI(sender_psid, response);
}

function handlePostback(sender_psid, received_postback) {
  console.log('ok');
  let response;
  let payload = received_postback.payload;
  if (payload === 'GetStarted') {
    // response = {
    //   // "text": "Chào mừng bạn đến với BK FC THPT Đức Hoà! Mọi vấn đề cần được giải đáp, giúp đỡ chúng mình sẽ cố gắng phản hồi trong thời gian sớm nhất."
    // };
    response = math[0].q;
  } else if (payload === 'exam') {
    response = {
      "text": "Chọn môn học bạn muốn thi:",
      "quick_replies": [
        {
          "content_type": "text",
          "title": "Toán",
          "payload": "Math"
        }, {
          "content_type": "text",
          "title": "Lý",
          "payload": "Physic",
        }
      ]
    }
  } else if (payload === 'Math') {
    response = math[Math.floor(Math.random() * 3)].q
  } else {
    var ans = payload.toString().split("_");
    if (math[parseInt(ans[1])].a == ans[2]) {
      response = math[Math.floor(Math.random() * 3)].q
    } else {
      response = {
        "text": "Sai roi!"
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
    "uri": "https://graph.facebook.com/v6.0/me/messages",
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
    "uri": "https://graph.facebook.com/v6.0/me/messenger_profile",
    "qs": {
      "access_token": PAGE_ACCESS_TOKEN
    },
    "method": "POST",
    "json": {
      "persistent_menu": [{
        "locale": "default",
        "composer_input_disabled": false,
        "call_to_actions": [
          {
            "type": "postback",
            "title": "Làm thử một số bài thi",
            "payload": "exam"
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
    "uri": "https://graph.facebook.com/v6.0/me/messenger_profile",
    "qs": {
      "access_token": PAGE_ACCESS_TOKEN
    },
    "method": "POST",
    "json": {
      "get_started": {
        "payload": "GetStarted"
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