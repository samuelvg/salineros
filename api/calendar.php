<?php
declare(strict_types=1);
require_once __DIR__ . '/songs/bootstrap.php';
allow_cors();
header('Content-Type: text/calendar; charset=utf-8');

$icsUrl = (string)env('CALENDAR_ICS_URL', '');

$cacheDir = __DIR__ . '/../assets';
if (!file_exists($cacheDir)) @mkdir($cacheDir, 0775, true);
$cacheFile = $cacheDir . '/calendar-cache.ics';
$ttl = 300; // 5 min

$useCache = file_exists($cacheFile) && (time() - filemtime($cacheFile) < $ttl);

if ($useCache) {
  readfile($cacheFile);
  exit;
}

function fetch_ics($url) {
  if (!$url) return false;
  $ch = curl_init();
  curl_setopt_array($ch, [
    CURLOPT_URL => $url,
    CURLOPT_RETURNTRANSFER => true,
    CURLOPT_FOLLOWLOCATION => true,
    CURLOPT_CONNECTTIMEOUT => 8,
    CURLOPT_TIMEOUT => 15,
    CURLOPT_USERAGENT => 'LS-CalendarProxy/1.0',
    CURLOPT_SSL_VERIFYPEER => true,
  ]);
  $data = curl_exec($ch);
  $http = curl_getinfo($ch, CURLINFO_HTTP_CODE);
  $err  = curl_error($ch);
  curl_close($ch);
  if ($data === false || $http >= 400) {
    error_log("Calendar proxy error: HTTP $http - $err");
    return false;
  }
  return $data;
}

if ($icsUrl) {
  $data = fetch_ics($icsUrl);
  if ($data !== false) {
    file_put_contents($cacheFile, $data);
    echo $data;
    exit;
  }
}

if (file_exists($cacheFile)) {
  readfile($cacheFile);
  exit;
}

http_response_code(204);
echo "BEGIN:VCALENDAR\r\nVERSION:2.0\r\nPRODID:-//LS Proxy//EN\r\nEND:VCALENDAR\r\n";
