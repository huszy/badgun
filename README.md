# BADGUN
#### Blast from the Past!

A game made for [#GithubGameOff](https://twitter.com/GitHubGameOff) 2017.

Demo hosted on [itch.io](https://huszy.itch.io/badgun)

Sadly itch.io adds a very large header to the page and displays the game in iframe, and the page always scrolls out when you want to control the car with the arrow keys, so a frameless version is hosted [here](https://badgun.onceapps.com), or you can use W,A,S,D keys instead of arrows.

## Story

BADGUN, the hard-boiled Hawaiian cop loves his car. Only problem there, he drives her baby way too fast. He was fined so many times for speeding, that he loses his job. What could you do without money, without a job?

BADGUN starts car racing.

Help BADGUN get more money! Use the arrow keys (or W,A,S,D) to accelerate, slow down, or turn the car. Reach as far as possible in a given time, make your way to the next level. Collect as much coins as possible. Use the brake, sometime a slower speed gets you farther. Avoid the obstacles, and watch out for the heavy traffic.

Key features:
- Constantly accelerating gameplay
- Procedural retro music and sound effects
- Visuals of the 80s
- 7 Different Worlds

# Setup
You'll need to install a few things before you have a working copy of the project.

## 1. Clone this repo:

Navigate into your workspace directory.

Run:

```git clone https://github.com/huszy/badgun.git```

## 2. Install node.js and npm:

https://nodejs.org/en/


## 3. Install dependencies (optionally you can install [yarn](https://yarnpkg.com/)):

Navigate to the cloned repo's directory.

Run:

```npm install``` 

or if you chose yarn, just run ```yarn```

## 4. Run the development server:

Run:

```npm run dev```

This will run a server so you can run the game in a browser. It will also start a watch process, so you can change the source and the process will recompile and refresh the browser automatically.

To run the game, open your browser and enter http://localhost:3000 into the address bar.


## Build for deployment:

Run:

```npm run deploy```

This will optimize and minimize the compiled bundle.

## Credits
Big thanks to these great repos:

https://github.com/photonstorm/phaser-ce

https://github.com/lean/phaser-es6-webpack

https://github.com/belohlavek/phaser-es6-boilerplate

And this great free softwares:

https://draeton.github.io/stitches/

https://www.leshylabs.com/apps/sstool/
