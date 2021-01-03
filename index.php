<?php

require_once('vendor/autoload.php');
//dotenv config
\Dotenv\Dotenv::createImmutable(__DIR__)->load();    
//typings
use Discord\Discord;
use Discord\Parts\User\Member;
use Discord\WebSockets\Event;
use Discord\WebSockets\Intents;
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
$db->query('CREATE TABLE IF NOT EXISTS reputatations(
    id int primary key,
    reputation int
)');

$discord->on('ready', function ($discord) {
	echo "Bot is ready!", PHP_EOL;

	// Listen for messages.
	$discord->on('message', function ($message, $discord) {
        echo "{$message->author->username}: {$message->content}",PHP_EOL;
        if(!$message->author->user->bot){$message->reply("hi there");}
        # trying to get message mentions to get user object and get ID to add to DB. 
        # discord usernames/tags can change, but IDs cannot, so the ID will go in the DB
        // $d = array_key_first($message->mentions);
        // $message->channel->sendMessage("{$d}");
    });
    $discord->on(Event::GUILD_MEMBER_ADD, function (Member $member, Discord $discord) {
        //  $member->
        echo"{$member}";
	});
});
//run bot
$discord->run();