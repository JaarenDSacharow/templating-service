/**
 * Templating Service Prototype
 * Generates a template for an html email, sends via rabbit to notification service.
 */

const amqp = require('amqplib/callback_api');
const fs = require('fs');
const ejs = require('ejs');
const inLineCss = require('inline-css');
const pg = require('pg');
const atob = require('atob');

//inLine the styles
const inLineStyles = (html, msg) => {
    return new Promise((resolve, reject) => {
        try {
            inLineCss(html, {url: ' '}).then((html) => {
                html = new Buffer(html).toString('base64');
                const obj = JSON.parse(msg);
                obj.body = html;
                const output = JSON.stringify(obj);
                resolve(output);
            });
        } catch (err) {
            reject(err);
        }
    })
}

//retrieve the template from postgres
const getTemplate = (template_id) => {
    return new Promise((resolve,reject) => {
        try {
            let conString = "postgresql://postgres:postgres@172.31.13.12:5432/templates";
            let client = new pg.Client({
                connectionString: conString
            })
    
            client.connect();
        
            client.query("SELECT * FROM templates.template where id ="+template_id, (err, res) => {
                client.end(); //close connection, return to pool
                let decoded =  (atob(res.rows[0].content));
                resolve(decoded);
              
            });
            
        } catch(err) {
            reject(err);
        }
    })
}


//build the template
//This promise contains two nested promises, one to get the template from postgress and one to inline the styles.
//once generateTemplate is resolved, the app calles sendToNotificationService, below
const generateTemplate = (msg, obj) => {
    return new Promise((resolve, reject) => {
        try {
            const parsed = JSON.parse(msg);
            getTemplate(parsed.template_id)
            .then((data) => {
                //console.log(data);
                const compiled = ejs.compile(data);
                //console.log(obj);
                let html = compiled(obj);
                //console.log(html);
                inLineStyles(html, msg)
                .then((data) => resolve(data))
                .catch((err) => console.log(err));
            }).catch((err)=> console.log(err));
        } 
        catch(err) {
            reject(err);
        }
    });
}

//send along to the notifcation service

const sendToNotificationService = (msg) => {
    amqp.connect('amqp://ken:changeit@172.31.2.195:5672', (err,conn) => {
    // if you want the notification service to send back a failure code, send a property called "callback" with a url to post to.  
    // the notification service will send back the contents of a message along with a correlator I can include
        try{
            conn.createChannel((err,ch) => {
                console.log("created connection to notification service!");
                const ex = 'notify.exchange';
                
                ch.assertExchange('notify.exchange', 'direct', {durable: true});
                console.log(msg);
                ch.publish('notify.exchange', 'email.q.in', new Buffer(msg));
                //17863035546
                var msg2 = '{"type": "sms", "to": "+19548018589", "from": "+19548664830", "body": "You have a prescription!  Go to <br> /n %0a your portal to view.  http://portal3.entic-int.com/","attachments": []}'
                //console.log(msg2);
               // ch.publish(ex, 'sms.q.in', new Buffer(msg2));
                console.log(" [x]  Sent Test JSON!");
            });
            setTimeout(() => { conn.close();}, 500);
        } catch (e) {
            console.log(e);
        }
    });
} 

// connect to notification client, wait for a message
// upon receipt of a message, generate a template and send it along to
// the notification service once complete

amqp.connect('amqp://template:changeit@172.31.13.12:5672', (err, conn) => {
    conn.createChannel((err, ch) => {
        let ex = 'template.exchange';
        ch.assertExchange(ex, 'direct', {durable: true});
        ch.assertQueue('', {exclusive: true}, function(err, q) {
            console.log(' [*] Waiting for message. To exit press CTRL+C');
            ch.bindQueue(q.queue, ex, 'template.q.in');
            ch.consume(q.queue, function(msg) {
                  //console.log(" [x] %s: '%s'", msg.fields.routingKey, msg.content.toString());
                  console.log(msg.content.toString());
                  let obj = JSON.parse(msg.content.toString());
                  let data = obj.data;
                  generateTemplate(msg.content.toString(), data)
                  .then((data) => sendToNotificationService(data))
                  .catch((err) => console.log(err));
                }, {noAck: true});
              });
         });
});