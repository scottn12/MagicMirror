# Magic Mirror

This repository contains the software component for my personal smart mirror project. The project consists of displaying a mainly black screen with white text/images behind a two way mirror. This creates an effect where the end user can see both their reflection and the content.

This project was done using a locally hosted apache server on a raspberry pi that displays a non-interactive web page. The web page displays the following without any user interaction: time, location, weather, my personal calendar, the word of the day, and my personal top twitch streamers. This was done with plain HTML, CSS and javascript in combination with REST API's.

\* Note that this was designed specifically for a 27 inch 1920x1080p display, and would require CSS tweaking if used on a different display.