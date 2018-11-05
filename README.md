# README #

### Purpose ###

Node JS application for generating HTML email templates for the notification service.


### How do I get set up? ###

Clone repo

Run yarn install

Currently you will need a rabbit instance running locally with a direct durable exchange called 'testexchange' (hardcoded) 

type node templating_service.js

you will see a message which reads:

[*] Waiting for message. To exit press CTRL+C

type node simSend.js to send a message.  An email will be sent to the address specified in the "to" field in simSend.js, line 12.


### Who do I talk to? ###

* Jaaren Sacharow (jsacharow@entic.com)
