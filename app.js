var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');

var index = require('./routes/index');
var users = require('./routes/users');

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', index);
app.use('/users', users);


//Start of Bernard's trash code

var commandPrefix = '!';

const Discord = require("discord.js");
const client = new Discord.Client();

client.on("ready", () => {
    console.log("I am ready!");
});

client.on("disconnected", () => {
    console.log("Disconnected!");
    process.exit(1); //exit node.js with an error
});

client.on("message", (msg) => checkMessageForCommand(msg, false));


function checkMessageForCommand(msg) {

    //check if message is a command
    if(msg.author.id != client.user.id && (msg.content.startsWith(commandPrefix))){
        console.log("treating " + msg.content + " from " + msg.author + " as command");
        var cmdTxt = msg.content.split(" ")[0].substring(commandPrefix.length);
        var suffix = msg.content.substring(cmdTxt.length+commandPrefix.length+1);//add one for the ! and one for the space
        if(msg.isMentioned(client.user)){
            try {
                cmdTxt = msg.content.split(" ")[1];
                suffix = msg.content.substring(client.user.mention().length+cmdTxt.length+commandPrefix.length+1);
            } catch(e){ //no command
                msg.channel.send("Yes?");
                return;
            }
        }

        var cmd = commands[cmdTxt];
        if(cmdTxt === "help"){
            //help is special since it iterates over the other commands
            if(suffix){
                var cmds = suffix.split(" ").filter(function(cmd){return commands[cmd]});
                var info = "";
                for(var i=0;i<cmds.length;i++) {
                    var cmd = cmds[i];
                    info += "**"+commandPrefix + cmd+"**";
                    var usage = commands[cmd].usage;
                    if(usage){
                        info += " " + usage;
                    }
                    var description = commands[cmd].description;
                    if(description instanceof Function){
                        description = description();
                    }
                    if(description){
                        info += "\n\t" + description;
                    }
                    info += "\n"
                }
                msg.channel.send(info);
            } else {
                msg.author.send("**Available Commands:**").then(function(){
                    var batch = "";
                    var sortedCommands = Object.keys(commands).sort();
                    for(var i in sortedCommands) {
                        var cmd = sortedCommands[i];
                        var info = "**"+commandPrefix + cmd+"**";
                        var usage = commands[cmd].usage;
                        if(usage){
                            info += " " + usage;
                        }
                        var description = commands[cmd].description;
                        if(description instanceof Function){
                            description = description();
                        }
                        if(description){
                            info += "\n\t" + description;
                        }
                        var newBatch = batch + "\n" + info;
                        if(newBatch.length > (1024 - 8)){ //limit message length
                            msg.author.send(batch);
                            batch = info;
                        } else {
                            batch = newBatch
                        }
                    }
                    if(batch.length > 0){
                        msg.author.send(batch);
                    }
                });
            }
        }
        else if(cmd) {

                try{
                    cmd.process(client,msg,suffix);
                } catch(e){
                    var msgTxt = "command " + cmdTxt + " failed :(";

                    msg.channel.send(msgTxt);
                }

        } else {
            msg.channel.send(cmdTxt + " not recognized as a command!").then((message => message.delete(8000)))
        }
    } else {
        //message isn't a command or is from us
        //drop our own messages to prevent feedback loops
        if(msg.author == client.user){
            return;
        }

        if (msg.author != client.user && msg.isMentioned(client.user)) {
            msg.channel.send(msg.author + ", you called?");
        } else {

        }
    }
}

var commands = {
    "ping": {
        description: "responds pong, useful for checking if client is alive",
        process: function(client, msg, suffix) {
            msg.channel.reply(" pong!");
            if(suffix){
                msg.channel.send( "note that !ping takes no arguments!");
            }
        }
    },
    "idle": {
        usage: "[status]",
        description: "sets client status to idle",
        process: function(client,msg,suffix){
            client.user.setStatus("idle");
            client.user.setGame(suffix);
        }
    },
    "online": {
        usage: "[status]",
        description: "sets bot status to online",
        process: function(bot,msg,suffix){
            client.user.setStatus("online");
            client.user.setGame(suffix);
        }
    }
    /*
    "start": {
        usage: "[songname]",
        description: "starts to play karaoke with chosen song",
        process: function(client,msg,suffix){
            client.user.
        }
    }
     */
};


client.login('MzEyOTczOTEyMTk3ODI0NTEy.C_jCkg.lVrGcLzIMW1whPESVesgRe7McZQ');


//End of Bernard's trash code


// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
