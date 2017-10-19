const twitchStreams = require('twitch-get-stream')(******);
const shoutCast = require('./shoutcast')(******);
const Discordie = require('discordie');
const Promise = require('promise');
const request = require('request');
const Events = Discordie.Events;
const fs = require('fs');
const prefix = 'tsun!';
const rolename = "Tsundere-Chan";
const slapgifpath = './tsunfile/slap/';
const tacklegifpath = "./tsunfile/tackle/";
const kickgifpath = './tsunfile/kick/';
const poutgifpath = './tsunfile/pout/';
const patgifpath = './tsunfile/pat/';
const rollgifpath = './tsunfile/roll/';
const pokegifpath = './tsunfile/poke/';
const permissionpath = './tsunfile/tsunperm.txt';
const channelpath = './tsunfile/tsunchannel.txt';
const authorid = ******;
var client = new Discordie({
    autoReconnect: true
});
var players = [];
var channels = [];
//Moderator - Radio - Normal Commands
var guildPermissions = [];
var guildVoiceChannel = [];
var stationEnum = {
    Twitch: 'Twitch',
    Shoutcast: 'SHOUTcast'
}

client.connect({
    token: ******
});

client.User.setStatus(null, {
    type: 2,
    name: 'tsun!help for help',
    url: ""
});

client.Dispatcher.on(Events.GATEWAY_READY, e => {
    guildPermissions = JSON.parse(fs.readFileSync(permissionpath));
    //guildVoiceChannel = JSON.parse(fs.readFileSync(channelpath));
});

client.Dispatcher.on(Events.GUILD_CREATE, e => {
    fixPermissions(e.guild.id);
});

client.Dispatcher.on(Events.MESSAGE_CREATE, e => {
    try {
        var command = e.message.content;
        if (command.startsWith(prefix)) {
            //Some values

            var sender = e.message.member;
            var permissionImportance = getUserImportance(e);

            if (permissionImportance == 99) {
                if (command.startsWith(prefix + 'changepermission')) {
                    var commandReplaced = command.slice(command.indexOf(" ") + 1, command.length);
                    var permissionArr = commandReplaced.split(",");
                    if (permissionArr.length != 3) {
                        e.message.channel.sendMessage("Make sure to separate 3 permissions with ','")
                    } else {
                        e.message.channel.sendMessage("Changing permissions.")
                        changePermissions(e.message.guild.id, permissionArr[0], permissionArr[1], permissionArr[2]);
                    }
                    return;
                }
            }
            if (permissionImportance >= 3) {
                if (command.startsWith(prefix + 'voicechannel')) {
                    e.message.channel.sendMessage("Changing voice channel")
                    changeVoiceChannel(e.message.guild.id, command.slice(command.indexOf(" ") + 1, command.length), e);
                    return;
                }
            }
            if (permissionImportance >= 2) {
                if (command.startsWith(prefix + 'radiostart')) {
                    e.message.channel.sendMessage("Starting radio stream.");
                    joinVoiceChannel(e.message.guild.id);
                    return;
                } else if (command.startsWith(prefix + 'radiostop')) {
                    e.message.channel.sendMessage("Stopping radio stream.");
                    leaveVoiceChannel(e.message.guild.id);
                    return;
                } else if (command.startsWith(prefix + 'radiotwitch')) {
                    var query = command.slice(command.indexOf(" ") + 1, command.length);
                    joinVoiceChannel(e.message.guild.id);
                    startMusicStream({
                        name: query,
                        radio: stationEnum.Twitch
                    }, e);
                    return;
                } else if (command.startsWith(prefix + 'radiosc')) {
                    var query = command.slice(command.indexOf(" ") + 1, command.length);
                    joinVoiceChannel(e.message.guild.id);
                    startMusicStream({
                        name: query,
                        radio: stationEnum.Shoutcast
                    }, e);
                    return;
                } else if (command.startsWith(prefix + 'searchsc')) {
                    var query = command.slice(command.indexOf(" ") + 1, command.length);
                    shoutCast.searchStations(query, shoutCast.searchType.SEARCH, 5).then(function(result) {
                        var fieldArr = [];

                        var stations = result.getElementsByTagName("station");
                        for (var i = 0; i < stations.length; ++i) {
                            var stationName = (i + 1) + ". " + stations[i].getAttribute('name');
                            var stationCT = stations[i].getAttribute('ct') ? stations[i].getAttribute('ct') : "Song Title Unavailable";
                            fieldArr.push({
                                name: stationName,
                                value: stationCT
                            });
                        }

                        e.message.channel.sendMessage("", false, {
                            color: 0x3498db,
                            author: {
                                name: "Tsundere-Chan",
                                icon_url: client.User.avatarURL
                            },
                            title: "Search results for: \"" + query + "\"",
                            timestamp: new Date(),
                            fields: fieldArr,
                            footer: {
                                text: "Powered by SHOUTcast"
                            }
                        }).catch(function(e) {
                            console.log(e);
                        });
                    }).catch(function(e) {
                        console.log(e);
                    });
                return;
                }

            }
            if (permissionImportance >= 1) {
                if (command.startsWith(prefix + "help")) {
                    e.message.author.openDM().then(function(dm) {
                        dm.sendMessage("", false, {
                            color: 0x3498db,
                            author: {
                                name: "Tsundere-Chan",
                                icon_url: client.User.avatarURL
                            },
                            title: "I'm only doing this because you asked!",
                            timestamp: new Date(),
                            fields: [{
                                name: "Gif commands",
                                value: "**tsun!kick [mention]:** Kick someone with a gif \n" +
                                    "**tsun!pat [mention]:** Pat someone with a gif \n" +
                                    "**tsun!poke [mention]:** Poke someone with a gif \n" +
                                    "**tsun!pout:** Show your pout with a gif \n" +
                                    "**tsun!roll:** Roll around at the speed of sound with a gif \n" +
                                    "**tsun!slap [mention]:** Slap someone with a gif \n" +
                                    "**tsun!tackle [mention]:** Tackle someone with a gif"
                            }, {
                                name: "Music",
                                value: "**tsun!radiostart:** Start radio \n" +
                                    "**tsun!radiostop:** Stop radio \n" +
                                    "**tsun!radiotwitch:** Change twitch channel \n" +
                                    "**tsun!voicechannel:** Change voice channel"
                            }, {
                                name: "Moderation",
                                value: "**tsun!changepermission:** Change permisisons for commands (Moderator,Music,Normal)"
                            }],
                            footer: {
                                text: "You better memorize it, baka."
                            }
                        });
                    });
                } else if (command.startsWith(prefix + 'pout')) {
                    e.message.channel.uploadFile(getRandomFileName(poutgifpath), "pout.gif", "<@" + sender.id + "> is pouting.");
                } else if (command.startsWith(prefix + 'roll')) {
                    e.message.channel.uploadFile(getRandomFileName(rollgifpath), "roll.gif", "<@" + sender.id + "> is rolling around.");
                } else if (e.message.mentions.length != 1) {
                    e.message.channel.uploadFile('./tsunfile/misc/misatoshot.gif', 'baka.gif',
                        "Learn how to use command, you baka!");
                } else if (e.message.mentions[0].id == client.User.id) {
                    e.message.channel.uploadFile("./tsunfile/misc/misato.JPG", "baka.jpg", "");
                } else if (e.message.mentions[0].bot) {
                    e.message.channel.uploadFile("./tsunfile/misc/misatoprotecc.gif", 'baka.gif',
                        "I'll never abuse a fellow bot because of idiots like you, understand?");
                } else if (e.message.mentions[0].id == sender.id) {
                    e.message.channel.uploadFile("./tsunfile/misc/misatodisappointed.gif", 'baka.gif',
                        "You really think I'd fall for that simple trick? Baka.");
                } else if (command.startsWith(prefix + 'slap')) {
                    e.message.channel.uploadFile(getRandomFileName(slapgifpath), "slap.gif",
                        "<@" + e.message.mentions[0].id + ">, you got a slap from <@" + sender.id + ">.");
                } else if (command.startsWith(prefix + 'tackle')) {
                    e.message.channel.uploadFile(getRandomFileName(tacklegifpath), "tackle.gif",
                        "<@" + e.message.mentions[0].id + ">, you got a tackle from <@" + sender.id + ">.");
                } else if (command.startsWith(prefix + 'kick')) {
                    e.message.channel.uploadFile(getRandomFileName(kickgifpath), "kick.gif",
                        "<@" + e.message.mentions[0].id + ">, you got a kick from <@" + sender.id + ">.");
                } else if (command.startsWith(prefix + 'pat')) {
                    e.message.channel.uploadFile(getRandomFileName(patgifpath), "pat.gif",
                        "<@" + e.message.mentions[0].id + ">, you got a pat from <@" + sender.id + ">.");
                } else if (command.startsWith(prefix + 'poke')) {
                    e.message.channel.uploadFile(getRandomFileName(pokegifpath), "poke.gif",
                        "<@" + e.message.mentions[0].id + ">, you got a poke from <@" + sender.id + ">.");
                }
            }
        }
    } catch (err) {
        client.Users.get(authorid).openDM().then(function(dm) {
            console.log(err);
        });
    }
});

function getRandomFileName(path) {
    var files = fs.readdirSync(path);
    return path + files[Math.floor(Math.random() * files.length)];
}

function startMusicStream(info, e) {
    getStream(info, e).then(function(stream) {
        var foundChannel = false;
        channels.forEach(function(a, index) {
            if (a.guildID === e.message.guild.id) {
                foundChannel = true;
                a.channelName = stream.channelName;
                a.url = stream.url;
            }
        });

        if (!foundChannel) {
            channels.push({
                guildID: e.message.guild.id,
                channelName: stream.channelName,
                url: stream.url
            });
        }

        if (stream) {
            var voiceConnection;
            guildVoiceChannel.forEach(function(a, index) {
                if (a.guildID == e.message.guild.id) {
                    for (var i = 0; i < client.VoiceConnections.length; ++i) {
                        if (client.VoiceConnections[i].voiceConnection.channel.name.includes(a.name)) {
                            voiceConnection = client.VoiceConnections[i].voiceConnection;
                        }
                    }
                }
            });

            var encoder = voiceConnection.createExternalEncoder({
                type: "ffmpeg",
                source: stream.url
            });

            encoder.once("end", () => leaveVoiceChannel(e.message.guild.id));

            var encoderStream = encoder.play();
            encoderStream.resetTimestamp();
            encoderStream.removeAllListeners("timestamp");

            var found = false;
            players.forEach(function(a, j) {
                if (a.guildID === e.message.guild.id) {
                    players[j].enc = encoder;
                }
            });

            if (!found) {
                joinVoiceChannel(e.message.guild.id);
                players.push({
                    guildID: e.message.guild.id,
                    enc: encoder,
                    station: info.radio
                });
            }

            e.message.channel.sendMessage('Now listening to ' + stream.channelName + ' on ' + info.radio);
        }
    }).catch(function(err) {
        console.log(err);
    });
}

function joinVoiceChannel(guildID) {
    var channelID = null;
    fixVoiceChannel(guildID);
    guildVoiceChannel.forEach(function(a, index) {
        var guild = client.Guilds.get(guildID);
        for (var i = 0; i < guild.voiceChannels.length; ++i) {
            if (guild.voiceChannels[i].name === a.name) {
                guild.voiceChannels[i].join();
            }
        }
        return;
    });
}

function leaveVoiceChannel(guildID) {
    players.forEach(function(a, j) {
        if (a.guildID === guildID) {
            var encoder = a.enc;
            encoder.destroy();
            for (var i = 0; i < client.VoiceConnections.length; ++i) {
                if (client.VoiceConnections[i].voiceConnection.guildId === a.guildID) {
                    client.VoiceConnections[i].voiceConnection.disconnect();
                }
            }
            players.splice(j, 1);
        }
    });
}

function fixPermissions(guildID) {
    found = false;
    guildPermissions.forEach(function(a, index) {
        if (a[0] == guildID) {
            found = true;
            return;
        }
    });
    if (!found) {
        guildPermissions.push([guildID, "", "", "everyone"]);
    }
}

function changePermissions(guildID, moderator, music, commands) {
    fixPermissions(guildID);
    guildPermissions.forEach(function(a, index) {
        if (a[0] == guildID) {
            guildPermissions[index] = [guildID, moderator, music, commands];
            return;
        }
    });
    fs.writeFile(permissionpath, JSON.stringify(guildPermissions), function() {});
}

function fixVoiceChannel(guildID) {
    found = false;
    guildVoiceChannel.forEach(function(a, index) {
        if (a[0] == guildID) {
            found = true;
            return;
        }
    });
    if (!found) {
        var guild = client.Guilds.get(guildID);
        guildVoiceChannel.push({
            guildID: guildID,
            name: guild.voiceChannels[0].name
        });
    }
}

function changeVoiceChannel(guildID, voiceChannelName, e) {
    fixVoiceChannel(guildID)
    guildVoiceChannel.forEach(function(a, index) {
        if (a[0] == guildID) {
            guildVoiceChannel[index] = {
                guildID: guildID,
                name: voiceChannelName
            };
            return;
        }
    });
    fs.writeFile(channelpath, JSON.stringify(guildVoiceChannel), function() {});
    joinVoiceChannel(e)
}

function getUserImportance(e) {
    //TODO: Turn into ENUM
    fixPermissions(e.message.guild.id);
    var permissionArr = [];
    guildPermissions.forEach(function(a, index) {
        if (e.message.guild.id == a[0])
            permissionArr = a;
    });

    if (e.message.author.id == e.message.guild.owner_id)
        return 99; //Owner
    else if (e.message.member.hasRole(permissionArr[1]) || permissionArr[1] === "everyone")
        return 3; //Moderator
    else if (e.message.member.hasRole(permissionArr[2]) || permissionArr[2] === "everyone")
        return 2; //Music
    else if (e.message.member.hasRole(permissionArr[3]) || permissionArr[3] === "everyone")
        return 1; //Normal
    else
        return 0; //Everyone
}

function getStream(channel, e) {
    return new Promise(function(resolve, reject) {
        if (channel.radio == stationEnum.Twitch) {
            twitchStreams.get(channel.name)
                .then(function(streams) {
                    return resolve({
                        channelName: channel.name,
                        url: streams[0].url
                    });
                }).catch(function(err) {
                    return reject(channel.name);
                });
        } else if (channel.radio == stationEnum.Shoutcast) {
            shoutCast.tuneIn(channel.name)
                .then(function(streams) {
                    request.get(streams.url, function(error, reponse, body) {
                        if (!error) {
                            var streamURL = body.slice(body.indexOf('File1=') + 6, body.indexOf('Title1') - 1);
                            if (!streamURL.includes('/stream')) {
                                streamURL = streamURL + '/stream';
                            }
                            return resolve({
                                channelName: streams.stationName,
                                url: streamURL
                            });
                        }
                    });

                }).catch(function(err) {
                    return reject(channel.name)
                });
        }
    });
}