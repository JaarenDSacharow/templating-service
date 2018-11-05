const amqp = require('amqplib/callback_api');

//connect to rabbit server

amqp.connect('amqp://template:changeit@172.31.13.12:5672', (err,conn) => {

    //open a channel
    conn.createChannel((err,ch) => {
        var q = 'hello';
        // const obj =  { // this data will need to come from the data source
        //     title: 'Notification',
        //     name: 'Jaaren',
        //     alert_cause : 'Air Handler Unit - Chilled Water Valve Not Modulating',
        //     facility_code: 'parkave',
        //     facility_name: 'Park Ave Tower',
        //     data_points: {
        //         device_name : 'AHU_1C05', 
        //         data_point_name : 'N/A', 
        //         issue: 'Supply air temperature (66.8) is higher than setpoint (55.0) while the valve has not modulated (Estimated AHU 0.0 Tons)', 
        //         cause: 'Heat transfer capabilities have been compromised, unachievable setpoint, excessive outdoor air intake',
        //         solution: 'Check cooling coil performance or increase setpoint',
        //         daily_cost: '103.23'
        //     }
        //   }; 
        const obj = {
            name: 'TestUser',
            title: 'Password Reset',
            link: "http://localhost:8888/index.php/ExternalAuthentication/validate_token/lkfjgklfklgjfdlgjkldfgl"
        }
        var ex = 'template.exchange';
        //"jkaire@entic.com","mrosendo@enticusa.com"
        //efrank@entic.com
        //vee.retsob@gmail.com
        //amejia@entic.com
        //var msg = '{"type":"email", "template_id": "5", "data": '+JSON.stringify(obj)+', "from":"alertmanager@entic.com","to":["jsacharow@entic.com"],"subject":"Password Reset","body":"","attachments":[]}';
        var msg ='{"type":"email","template_id":"5","from":"alertmanager@entic.com","to":["ejohnson@entic.com", "jsacharow@entic.com"],"subject":"Password Reset","body":"","attachments":[],"data":{"name":"Erik Johnson","link":"http:\/\/localhost:8888\/index.php\/ExternalAuthentication\/validate_token\/632effbdf2be07c34049ccc64707b5b8"}}';
        ch.assertExchange(ex, 'direct', {durable: true});

        ch.publish(ex, 'template.q.in', new Buffer(msg));

        console.log(" [x]  Sent Test JSON!");
    });
    //close channel and kill process
    setTimeout(() => { conn.close(); process.exit(0) }, 500);

});


