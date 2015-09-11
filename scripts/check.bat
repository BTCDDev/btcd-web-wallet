@echo off
tasklist /fi "imagename eq BitcoinDarkd.exe" | find /i "BitcoinDarkd.exe" > nul
if not errorlevel 1 (echo 1) else (
  echo 0
)
