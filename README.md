# sa-score-pitstop

This is a fork of <a href="https://staratlas.club/">The Club</a>'s excellent dashboard for Star Atlas SCORE.  
Original app: <a href="https://github.com/the-sa-club/sa-score-pitstop">`https://github.com/the-sa-club/sa-score-pitstop`</a>


----------------

<a href="https://mattsahr.github.io/sa-score-pitstop">Working Demo</a>

![App Screenshot](https://github.com/mattsahr/sa-score-pitstop/blob/main/src/assets/images/screencap-sa-score-pitstop-a.png?raw=true "App Screenshot")

### Main Differences
Besides visual design tweaks, this fork differs from the original in a few important ways.

#### 1 -- You need your own API key.  

Figment.io provides free API service for Solana ecosystem apps.  It's a generous free tier (10 requests per second, and 3 million requests per month)   The first time you run this app, it will tell you to go get an API key from Figment.io.  In the original version, a key for **The Club**'s endpoint is provided.

![API Key](https://github.com/mattsahr/sa-score-pitstop/blob/main/src/assets/images/screencap-sa-score-pitstop-need-api-key.png?raw=true "API Key")
#### 2 -- This fork does less.  

The original app has functions for buying resources when you run out.  This version just links to the regular <a href="https://play.staratlas.com/market/">Star Atlas Marketplace</a> for purposes of buying more ammo/fuel/food/tools.  

The reason for this is again related to the API endpoint.  The free tier of API access just doesn't cut it.  While 10 requests per second and 3 million requests per month is plenty generous, the limits get a bit taxed when you start, like, doing significant stuff.  It's easy to overlook just how **chatty** solana data and contracts are.  Getting the resource-buy functions to be reliable basically requires a higher tier (paid tier) of API access from Figment.io.

**PROBABLY POSSIBLE**

Hooking up buy buttons for ammo/fuel/food/tools is probably achievable.  But I couldn't get it to work reliably.  And I think the limited scope (just resupply and claim Atlas buttons) is still worthwhile on its own. 


#### 3 -- This fork hosts images

The original app uses an API enpoint for small images that is hosted by **The Club**.  

This version just includes small images for each ship in the app build.  In the event that we don't have a ship's image, the "official" image from the Star Atlas source is used.   The official images are big (sometims 5 MB!) 

Hosting the images in-app means that the app is dependent on a hand-curated list of ships and images.  So whenever new ships get released, this app is immediately out of date, relying on the big/slow images for any new ships.  That's bad.  But at least the app not leaning on outside API support.


### Install

Assuming you have `node` and `git` running on your machine:

```
git clone https://github.com/mattsahr/sa-score-pitstop
cd sa-score-pitstop
npm install
npm run start
```
