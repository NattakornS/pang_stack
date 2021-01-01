'use strict';

/**
 * Read the documentation (https://strapi.io/documentation/3.0.0-beta.x/concepts/controllers.html#core-controllers)
 * to customize this controller
 */
const { getStatusMessage } = require('./../../../utils/utils')
const fs = require('fs')
const path = require('path')

// const webpush = require('web-push')
// const publicVapidKey = "BExfeg6yo79-xSvKRzDIxVQA-cwAScjL0ivq_soIf1qlsdKu8UU4-HtkaTUCTJe6eVBQ4eF7iMDgpmz8bDomf1s"
// const privateVapidKey = "Pp1eK7PN80E89XdPsZcDPUq3DeYdGlpLY6TgsAiCocQ"
// webpush.setVapidDetails(
//   "mailto:hr_wuh@wu.ac.th",
//   publicVapidKey,
//   privateVapidKey
// );
var express = require('express');
const request = require('request');
var router = express.Router();
//process.env.strapi.config.get('custom.pageAccessToken', '')
function callSendAPI(sender_psid, response) {
    // Construct the message body
    let request_body = {
      "recipient": {
        "id": sender_psid
      },
      "message": response
    }
    console.log(request_body);

    // Send the HTTP request to the Messenger Platform
    request({
      "uri": "https://graph.facebook.com/v7.0/me/messages",
      "qs": { "access_token": strapi.config.get('custom.pageAccessToken', '') },
      "method": "POST",
      "json": request_body
    }, (err, res, body) => {
      if (!err) {
        console.log('message sent!')
      } else {
        console.error("Unable to send message:" + err);
      }
    });
  }


  function handleMessage(sender_psid, received_message) {
    let response;

    // Checks if the message contains text
    if (received_message.text) {
      // Create the payload for a basic text message, which
      // will be added to the body of our request to the Send API
      response = {
        "text": `You sent the message: "${received_message.text}". Now send me an attachment!`
      }
    } else if (received_message.attachments) {
      // Get the URL of the message attachment
      let attachment_url = received_message.attachments[0].payload.url;
      response = {
        "attachment": {
          "type": "template",
          "payload": {
            "template_type": "generic",
            "elements": [{
              "title": "Is this the right picture?",
              "subtitle": "Tap a button to answer.",
              "image_url": attachment_url,
              "buttons": [
                {
                  "type": "postback",
                  "title": "Yes!",
                  "payload": "yes",
                },
                {
                  "type": "postback",
                  "title": "No!",
                  "payload": "no",
                }
              ],
            }]
          }
        }
      }
    }

    // Send the response message
    callSendAPI(sender_psid, response);
  }
  async function handlePostback(sender_psid, received_postback) {
    let response;

    // Get the payload for the postback
    let payload = received_postback.payload;
    switch (payload) {
      case 'GET_STARTED':
        response = getListMenu()
        // {
        //   text: " สวัสดีครับ ผมเป็นบอท \n" +
        //     " สามารถกดเมนูเพื่อถามผมได้\n"
        // }

        break;
      case 'SUB_SCRIBED':
        response = getSubScribe(sender_psid)
        break;
      case 'CHECKED_STATUS':
        response = await getCheckStatus(sender_psid)
        break;
      case 'yes':
        response = { "text": "Thanks!" }
        break;
      case 'no':
        response = { "text": "Oops, try sending another image." }
        break;
      default:
        response = { "text": "Implement logic for this Postback" };
        break;
    }
    // Set the response based on the postback payload
    // if (payload === 'yes') {
    //   response = { "text": "Thanks!" }
    // } else if (payload === 'no') {
    //   response = { "text": "Oops, try sending another image." }
    // }
    // Send the message to acknowledge the postback
    callSendAPI(sender_psid, response);
  }
  function getListMenu() {
    let response = {
      "attachment":{
        "type":"template",
        "payload":{
          "template_type":"button",
          "text":"ผมคือบอทครับ เลือกเมูด้านล่างได้เลยครับ",
          "buttons":[
            {
              "title": "กดล็อคอินครั้งแรกเพื่อยืนยันสมาชิก",
              "type": "postback",
              "payload": "SUB_SCRIBED"
            },
            {
              "title": "ตรวจสอบสถานะใบสมัคร",
              "type": "postback",
              "payload": "CHECKED_STATUS"
            },
            {
              "type": "web_url",
              "title": "เว็บแอป",
              "url": strapi.config.get('custom.webServer', ''),
              "webview_height_ratio": "full"
            }
          ]
        }
      }
    }
    return response
  }
  function getSubScribe(sender_psid) {
    let response = {
      attachment: {
          type: "template",
          payload: {
              template_type: "button",
              text: "กดติดตามเพื่อรับข่าวสารในกรณีมี user/password แล้ว",
              buttons: [{
                  type: "web_url",
                  url: strapi.config.get('custom.webServer', '') + "login?psid="+sender_psid,
                  title: "ติดตามข่าวสาร",
                  webview_height_ratio: "tall",
                  messenger_extensions: false
              }]
          }
      }
    };
    return response;
  }

  async function getCheckStatus (sender_psid) {
    // const user = strapi.plugins['users-permissions'].query('users')
    const user = await strapi
    .query('user','users-permissions')
    .findOne({psid: sender_psid}, ['username']);
    // console.log(user);

    const entity = await strapi.services['register-position'].find({iden_id: user.username})
    var elements = []
    for (let i = 0; i < entity.length; i++) {
      const el = entity[i];
      if (!el.register_status.status) {
        continue;
      }
      var passStatus = ''
      if (el.Pass === 'pass') {
        passStatus = true
      } else if (el.Pass === 'not_pass') {
        passStatus = false
      }

      let resEl = {
        title: el.position_open.title + ' สถานะ ' + el.register_status.status,
        image_url: "https://hospital.wu.ac.th/hr/statics/images/announce.png",
        subtitle: 'ชื่อผู้ใช้ ' + user.username + ' ' + el.Pass === 'default' ?  '' : getStatusMessage(el.register_status.id,passStatus),
        // default_action: {
        //   type: "web_url",
        //   url: strapi.config.get('custom.webServer', '')+"profile",//?action=status&id="+data.open_pos_id,
        //   // "webview_height_ratio": "tall",
        // },
        buttons:[
          {
            type:"web_url",
            url: strapi.config.get('custom.webServer', '')+"profile?action=status&id="+el.position_open.id,
            title:"เปิดดูผ่านเว็บแอป"
          }
        ]
      }
      elements.push(resEl)
    }
    let response = {
      attachment:{
        type:"template",
        payload:{
          template_type:"generic",
          elements
        }
      }
    }
    return response;
  }

  function setupGreetingText() {
    var messageData = {
      "greeting": [
        {
          "locale": "default",
          "text": "Greeting text for default local !"
        }, {
          "locale": "en_US",
          "text": "Greeting text for en_US local !"
        }
      ]
    };
    return request({
      url: 'https://graph.facebook.com/v7.0/me/messenger_profile?access_token=' + strapi.config.get('custom.pageAccessToken', ''),
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      form: messageData
    });

  }

  function setupPersistentMenu(res) {
    var messageData =
    {
      "persistent_menu": [
        {
          "locale": "default",
          "composer_input_disabled": false,
          "call_to_actions": [
            {
              "title": "กดติดตามสถานะการสมัคร",
              "type": "postback",
              "payload": "SUB_SCRIBED"
            },
            {
              "title": "ตรวจสอบสถานะใบสมัคร",
              "type": "postback",
              "payload": "CHECKED_STATUS"
            },
            {
              "title": "อื่นๆ",
              "type": "nested",
              "call_to_actions": [
                {
                  "type": "web_url",
                  "title": "เว็บแอป",
                  "url": strapi.config.get('custom.webServer', ''),
                  "webview_height_ratio": "full"
                },
                {
                  "title": "Help",
                  "type": "postback",
                  "payload": "HELP_PAYLOAD"
                },
                {
                  "title": "Contact Me",
                  "type": "postback",
                  "payload": "CONTACT_INFO_PAYLOAD"
                }
              ]
            }
          ]
        },
        {
          "locale": "th_TH",
          "composer_input_disabled": false
        }
      ]
    };
    // Start the request
    return request({
      url: "https://graph.facebook.com/v7.0/me/messenger_profile?access_token=" + strapi.config.get('custom.pageAccessToken', ''),
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      form: messageData
    });

  }


  function setupGetStartedButton(res) {
    var messageData = {
      "get_started": {
        "payload": "GET_STARTED"
      }
    };
    console.log(messageData);

    // Start the request
    return request({
      url: "https://graph.facebook.com/v7.0/me/messenger_profile?access_token=" + strapi.config.get('custom.pageAccessToken', ''),
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      form: messageData
    });
  }


module.exports = {

/* GET home page. */
test: async ctx => {
  console.log("test");
  // ctx.send('Hello World!');
  // return
  return getCheckStatus(1465716600145385)
},

// login: async ctx => {
//   let psid = ctx.query.psid
//   res.render('login', { psid});
// },

// optionspostback: async ctx => {
//   console.log(ctx.query);
//   res.json({
//     status: 200,
//     query: ctx.query
//   })
// },

// router.post('/webhook', function(req, res, next) {
//   console.log(ctx.body);
//   res.json({
//     status: 200
//   })
// });
setup: async ctx => {
  try {
    await setupGetStartedButton();
    await setupPersistentMenu();
    await setupGreetingText();
    ctx.status=200
    ctx.send("success")
  } catch (error) {
    ctx.status=403
    ctx.send(error)
  }
},

hrhook: async ctx => {
    console.log(ctx);
  let data = ctx.body.data;
  if(data.psid) {
    let response = {
      "attachment":{
        "type":"template",
        "payload":{
          "template_type":"generic",
          "elements":[
             {
              "title":"ประกาศอัตโนมัติระบบรับสมัครงาน รพ.ศูนย์การแพทย์ มวล.",
              "image_url": "https://hospital.wu.ac.th/hr/statics/images/announce.png",
              "subtitle": data.message,
              "default_action": {
                "type": "web_url",
                "url": strapi.config.get('custom.webServer', '')+"profile?action=status&id="+data.open_pos_id//"profile",//?action=status&id="+data.open_pos_id,
                // "webview_height_ratio": "tall",
              },
              "buttons":[
                {
                  "type":"web_url",
                  "url": strapi.config.get('custom.webServer', '')+"profile?action=status&id="+data.open_pos_id,//"profile",//?action=status&id="+data.open_pos_id,
                  "title":"เปิดดูผ่านเว็บแอป"
                }
              ]
            }
          ]
        }
      }
    }
    callSendAPI(data.psid,response)
    // ctx.sendStatus(200)
    ctx.status=200
  } else {
    console.log("no psid");
    ctx.status=403
    ctx.send('NO_PSID')
    // ctx.sendStatus(404)
  }
  return
},

webhook:  async ctx => {
  // Parse the request body from the POST
  let body = ctx.request.body;

  // Check the webhook event is from a Page subscription
  if (body.object === 'page') {

    // Iterate over each entry - there may be multiple if batched
      // Get the webhook event. entry.messaging is an array, but
      // will only ever contain one event, so we get index 0
      // console.log(ctx.body);
      body.entry.forEach(function (entry) {

        // Gets the body of the webhook event
        let webhook_event = entry.messaging[0];
        console.log(webhook_event);


        // Get the sender PSID
        let sender_psid = webhook_event.sender.id;

        console.log('Sender PSID: ' + sender_psid);

        // Check if the event is a message or postback and
        // pass the event to the appropriate handler function
        if (webhook_event.message) {
          // handleMessage(sender_psid, webhook_event.message);
          console.log(webhook_event.message);
        } else if (webhook_event.postback) {
          handlePostback(sender_psid, webhook_event.postback);
        }

      });

    // Return a '200 OK' response to all events
    // res.status(200).send('EVENT_RECEIVED');
    ctx.status = 200
    ctx.send('EVENT_RECEIVED')
  } else {
    // Return a '404 Not Found' if event is not from a page subscription
    // res.sendStatus(404);
    ctx.status = 404
  }
  return
},
webhookVerify: async ctx => {
  // Parse the query params
  let mode = ctx.query['hub.mode'];
  let token = ctx.query['hub.verify_token'];
  let challenge = ctx.query['hub.challenge'];

  // Checks if a token and mode is in the query string of the request
  if (mode && token) {

    // Checks the mode and token sent is correct
    if (mode === 'subscribe' && token === strapi.config.get('custom.tokenVerify', '')) {

      // Responds with the challenge token from the request
      console.log('WEBHOOK_VERIFIED');
      // ctx.status(200).send(challenge);
      ctx.status = 200
      ctx.send(challenge)
    } else {
      // Responds with '403 Forbidden' if verify tokens do not match
      // ctx.sendStatus(403);
      ctx.status = 403
    }
    return
  }
},
};
