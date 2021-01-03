<?php

require_once('vendor/autoload.php');
//dotenv config
\Dotenv\Dotenv::createImmutable(__DIR__)->load();    
//typings
use Discord\Discord;
use Discord\Parts\Channel\Message;
use Discord\Parts\User\Member;
use Discord\WebSockets\Event;
use Discord\WebSockets\Intents;

use function React\Promise\Stream\first;

//discord client creations
$discord = new Discord([
    'token' => $_ENV["DISCORD_TOKEN"],
    'intents' => [
        Intents::GUILDS, 
        Intents::GUILD_BANS, 
        Intents::GUILD_MEMBERS, 
        Intents::GUILD_MESSAGES,
        # Intents::GUILD_ ...
    ],
    ]);
//DB setup

$db = new SQLite3('records.db');
$db->query('CREATE TABLE IF NOT EXISTS reputations(
    id int primary key,
    reputation int
)');
$discord->on('ready', function ($discord) {
	echo "Bot is ready!", PHP_EOL;

	// Listen for messages.
	$discord->on('message', function ($message, $discord) {
        if(
           // !$message->author->user->bot&&
         explode(" ", $message->content)[0]=="rep" 
        && count($message->mentions)==1 
        //&& (explode(" ", $message->content)[0]=="++"||explode(" ", $message->content)[0]=="--")
        ){
            print("yes!\n\n\\n");
            $cmd = (explode(" ", $message->content));
            var_dump($cmd);
            array_shift($cmd); array_shift($cmd);
            $cmd = array_reverse($cmd);
            $cmd = array_shift($cmd);
            var_dump($cmd);
            $ids=$message->mentions;
            $mention;
            foreach($ids as $f => $val){
                global $mention;
                $mention = $val;
            }
            $id=$mention->id;
            var_dump($id);
            global $db;
            $username = $mention->username;
            $rep = $db->querySingle("SELECT reputation FROM reputations WHERE id={$id}");
            if($cmd=="++"){
                if($rep==NULL){
                     $db->query("INSERT INTO reputations VALUES({$id},1)");
                     $message->reply("set {$username}'s rep to 1");
                     var_dump("does not exist");
                }else{
                    $rep+=1;
                    $db->query("UPDATE reputations SET reputation={$rep} WHERE id={$id}");
                    $message->reply("set {$username}'s rep to {$rep}");
                    var_dump("does exist");
                }
               
            }else if($cmd=="--"){
                if($rep==NULL){
                     $db->query("INSERT INTO reputations VALUES({$id},{-1})");
                     $message->reply("set {$username}'s rep to -1");
                }else{
                    $rep-=1;
                    $db->query("UPDATE reputations SET reputation={$rep} WHERE id={$id}");
                    $message->reply("set {$username}'s rep to {$rep}");
                }
            }

        }
        # trying to get message mentions to get user object and get ID to add to DB. 
        # discord usernames/tags can change, but IDs cannot, so the ID will go in the DB
        
        //ar_dump(array_shift($message->mentions));
        // $message->channel->sendMessage("{$d}");
    });
    $discord->on(Event::GUILD_MEMBER_ADD, function (Member $member, Discord $discord) {
        //  $member->
        echo"{$member}";
	});
});
//run bot
$discord->run();
