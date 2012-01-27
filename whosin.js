net = require('net')
var fs = require('fs');
var team = {};
var timeTreshold = null;

 try {
    if (fs.lstatSync('team.js')) {
      config = require('./team');
      team = config.team;
      timeTreshold = config.timeTreshold; 
    }
  } catch(e) {
  }

//Initializing pcap session
var pcap = require('pcap')
var pcap_session = pcap.createSession();

pcap_session.on('packet', function (raw_packet) {
  if (raw_packet != undefined) {
    //hwaddr filtering by simple regexp
    var packet = pcap.decode.packet(raw_packet);
    var printed_packet = pcap.print.packet(packet);
    var pattern = /^(.*?) ->/;
    var matched = printed_packet.match(pattern);
    var hwaddr = matched[matched.length - 1]
    if (team[hwaddr]) {
      if (team[hwaddr].time == undefined || team[hwaddr].time == null || (secondsSinceLast(team[hwaddr].time) > timeTreshold) ){
        notifyFlower(team[hwaddr].name + team[hwaddr].greeting )
      }
     team[hwaddr].time = new Date().getTime();
   }
  }
 });

 var secondsSinceLast = function(last){
   return ((new Date().getTime() - last) / 1000);
 }

 var notifyFlower = function(msg){
  var client = net.createConnection(6000);
    client.addListener('connect', function(){client.write(msg)});
 }
