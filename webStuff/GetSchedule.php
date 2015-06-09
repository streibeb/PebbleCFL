<?php
include_once("simple_html_dom.php");

if (isset($_GET["year"])) {
    $year = $_GET["year"];
} else {
    $year = date("Y");
}
if (isset($_GET["time_zone"])) {
    $tz = strtolower($_GET["time_zone"]);
    switch ($tz) {
        case "pacific":
            $time_zone = "America/Vancouver";
            break;
        case "mountain":
            $time_zone = "America/Edmonton";
            break;
        case "central":
            $time_zone = "America/Winnipeg";
            break;
        case "eastern":
            $time_zone = "America/Toronto";
            break;
        case "atlantic":
            $time_zone = "America/Halifax";
            break;
        case "newfoundland":
            $time_zone = "America/St_Johns";
            break;
    }
} else {
    $time_zone = "America/Toronto";
}

$html = file_get_html("http://cfl.ca/schedule/list/?year=".$year."&time_zone=".$time_zone);

// Find schedule
$sResp = array();
$i = 0;
$lastWeekName = '';
foreach ($html->find("div.sked_tbl tr") as $schedule) {
    if ($schedule->getAttribute("class") == "table_head") continue;

    $count = count($schedule->children());
    if ($count == 3) {
        // Weeks
        if ($schedule->children(1)->first_child() != null) {
            $lastWeekName++;
            $sWeek = "Week ".$lastWeekName;
        } else {
            $sWeek = trim($schedule->children(1)->plaintext);
            $lastWeekName = substr($sWeek, strlen($sWeek)-2);
        }
        $sResp[] = array("name" => $sWeek, "games" => array());
        $i++;
    } else if ($count != 1) {
        // Games
        $date = strtotime(trim($schedule->children(0)->plaintext));
        $time = strtotime(trim($schedule->children(5)->plaintext));
        $sGame["Date"] = date('M j',$date)." ".date('g:i a',$time);

        $sGame["AwayTeam"] = trim($schedule->children(1)->plaintext);
        $sGame["AwayTeamShort"] = GetShortName($sGame["AwayTeam"]);
        $sGame["AwayScore"] = trim($schedule->children(2)->plaintext);
        $sGame["HomeTeam"] = trim($schedule->children(3)->plaintext);
        $sGame["HomeTeamShort"] = GetShortName($sGame["HomeTeam"]);
        $sGame["HomeScore"] = trim($schedule->children(4)->plaintext);

        $sResp[$i-1]["games"][] = $sGame;
    }
}

echo json_encode($sResp);

function GetShortName($name) {
    switch ($name) {
        case "BC":
            return "BC";
        case "Calgary":
            return "CGY";
        case "Edmonton":
            return "EDM";
        case "Saskatchewan";
            return "SSK";
        case "Winnipeg":
            return "WPG";
        case "Hamilton";
            return "HAM";
        case "Toronto";
            return "TOR";
        case "Ottawa";
            return "OTT";
        case "Montreal":
            return "MTL";
        default:
            return "TBD";
    }
}