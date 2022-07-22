class Game {
  constructor() {
    this.resetTitle = createElement("h2");
    this.resetButton = createButton("");

    this.leaderBoardTitle = createElement("h2");
    this.leader1 = createElement("h2");
    this.leader2 = createElement("h2");
    this.LEFT_ARROW = false

    this.playermovement = false
  }
  getState() {
    var gameStateRef = database.ref("gameState");
    gameStateRef.on("value", function (data) {
      gameState = data.val();
    });
  }
  update(state) {
    database.ref("/").update({
      gameState: state,
    });
  }

  start() {
    player = new Player();
    playerCount = player.getCount();

    form = new Form();
    form.display();

    car1 = createSprite(width / 2 - 50, height - 100);
    car1.addImage("car1", car1_img);
    car1.scale = 0.07;

    car2 = createSprite(width / 2 + 100, height - 100);
    car2.addImage("car2", car2_img);
    car2.scale = 0.07;

    cars = [car1, car2];

    // C38 TA
    fuels = new Group();
    powerCoins = new Group();

    obsticle1 = new Group();
    obsticle2 = new Group();


    // Adding fuel sprite in the game
    this.addSprites(fuels, 4, fuelImage, 0.02);

    // Adding coin sprite in the game
    this.addSprites(powerCoins, 18, powerCoinImage, 0.09);

    this.addSprites(obsticle1, 15, obsticle1Image, 0.03)

    this.addSprites(obsticle2, 15, obsticle2Image, 0.03)
  }

  // C38 TA
  addSprites(spriteGroup, numberOfSprites, spriteImage, scale) {
    for (var i = 0; i < numberOfSprites; i++) {
      var x, y;

      x = random(width / 2 + 250, width / 2 - 250);
      y = random(-height * 4.5, height - 400);

      var sprite = createSprite(x, y);
      sprite.addImage("sprite", spriteImage);

      sprite.scale = scale;
      spriteGroup.add(sprite);
    }
  }

  handleElements() {
    form.hide();
    form.titleImg.position(40, 50);
    form.titleImg.class("gameTitleAfterEffect");
    this.resetTitle.html("Reset Game");
    this.resetTitle.class("resetText");
    this.resetTitle.position(width / 2 + 200, 40);

    this.resetButton.class("resetButton");
    this.resetButton.position(width / 2 + 230, 100);

    this.leaderBoardTitle.html("leaderboard");
    this.leaderBoardTitle.position(500, 50);
    this.leaderBoardTitle.class("resetText");

    this.leader1.class("leadersText");
    this.leader2.class("leadersText");
    this.leader1.position(width / 3 - 50, 80);
    this.leader2.position(width / 3 - 50, 130);
  }

  play() {
    this.handleElements();
    this.handleResetButton();
    Player.getPlayersInfo();
    player.getcarsAtEndinfo();

    if (allPlayers !== undefined) {
      image(track, 0, -height * 5, width, height * 6);
      this.showleaderboard();
      this.showfuelbar();
      this.showCoinsbar();
      //index of the array
      var index = 0;
      for (var plr in allPlayers) {
        //add 1 to the index for every loop
        index = index + 1;

        //use data form the database to display the cars in x and y direction
        var x = allPlayers[plr].positionX;
        var y = height - allPlayers[plr].positionY;

        cars[index - 1].position.x = x;
        cars[index - 1].position.y = y;

        // C38  SA
        if (index === player.index) {
          stroke(10);
          fill("red");
          ellipse(x, y, 60, 60);
          textSize(30) 
          fill("white")
          textAlign(CENTER)
          text(player.name, x, y-60)
          

          this.handleFuel(index);
          this.handlePowerCoins(index);
          this.handleObsticles(index);

          // Changing camera position in y direction
         // camera.position.x = cars[index - 1].position.x;
          camera.position.y = cars[index - 1].position.y;
        }
      }

      const finishline = height * 6 - 100;
      if (player.positionY > finishline) {
        gameState = 2;
        player.rank += 1;
        Player.updatecarsAtEnd(player.rank);
        player.update();
        this.showrank();
      }
    
      // handling keyboard events
      if (keyIsDown(UP_ARROW)) {
        player.positionY += 10;
        player.update();
      }
      this.handlePlayerControls();

      drawSprites();
    }
  }

  handleFuel(index) {
    // Adding fuel
    cars[index - 1].overlap(fuels, function (collector, collected) {
      player.fuel = 180;
      //collected is the sprite in the group collectibles that triggered
      //the event
      collected.remove();
    });
    if(player.fuel>0 && this.playermovement){ 
      player.fuel-=0.3 
    }
    if(player.fuel<=0){
      this.gameover()
    }
  }

  handlePowerCoins(index) {
    cars[index - 1].overlap(powerCoins, function (collector, collected) {
      player.score += 21;
      player.update();
      //collected is the sprite in the group collectibles that triggered
      //the event
      collected.remove();
    });
   /* if(player.life>0 && this.playermovement){
      player.life-=0.3
    }*/
  }
  
  handleObsticles(index){
   if(cars [index - 1].collide(obsticle1) || cars [index - 1]. collide(obsticle2)){
    if(this.LEFT_ARROW){
    this.positionX += 100
    }
    else{
    this.positionX -= 100
    }
    if(player.life>0 && this.playermovement){
      player.life-= 180/4
      //console.log("collided")
    }
   }
  }

  showrank() {
    swal({
      title: `Awesome ${"\n"}  ${player.rank} Rank${"\n"} ${player.score}`,
      text: "play again?",
      imageUrl:
        "https://raw.githubusercontent.com/vishalgaddam873/p5-multiplayer-car-race-game/master/assets/cup.png",
      imageSize: "100x100",
      confirmButtonText: "Ok"
    });
  }


  gameover(){
    swal({
      title: `You lost :( ${"\n"} Score${"\n"} ${player.score}`,
      text: "play again?",
      imageUrl:
        "https://cdn.shopify.com/s/files/1/1061/1924/products/Thumbs_Down_Sign_Emoji_Icon_ios10_grande.png",
      imageSize: "100x100",
      confirmButtonText:"Thanks for playing"
    });
  }

  handleResetButton() {
    this.resetButton.mousePressed(() => {
      database.ref("/").set({
        playerCount: 0,
        gameState: 0,
        carsAtEnd: 0,
        players: {}, 
        
      });
      window.location.reload();
    });
  }
  handlePlayerControls() {
    if (keyIsDown(UP_ARROW)) {
      player.positionY += 10;
      player.update();
      this.playermovement= true
     
    }

    if (keyIsDown(LEFT_ARROW) && player.positionX > width / 3 - 50) {
      player.positionX -= 5;
      player.update();
      this.playermovement= true
      this.LEFT_ARROW = true
    }

    if (keyIsDown(RIGHT_ARROW) && player.positionX < width / 2 + 300) {
      player.positionX += 5;
      player.update();
      this.playermovement= true
      this.LEFT_ARROW = false
    }
  }

  showleaderboard() {
    var myleader1, myleader2;
    var players = Object.values(allPlayers);
    //console.log(players)

    if (
      (players[0].rank === 0 && players[1].rank === 0) ||
      players[0].rank === 1
    ) {
      myleader1 =
        players[0].rank +
        "&emsp;" +
        players[0].name +
        "&emsp;" +
        players[0].score;
      myleader2 =
        players[1].rank +
        "&emsp;" +
        players[1].name +
        "&emsp;" +
        players[1].score;
    }
    if (players[1].rank === 1) {
      myleader1 =
        players[1].rank +
        "&emsp;" +
        players[1].name +
        "&emsp;" +
        players[1].score;
      myleader2 =
        players[0].rank +
        "&emsp;" +
        players[0].name +
        "&emsp;" +
        players[0].score;
    }
    this.leader1.html(myleader1);
    this.leader2.html(myleader2);
  }

  showfuelbar(){

    push()
    image(fuelImage,width/2-130,height-player.positionY-100,20,20)
    fill("white")
    rect(width/2-100,height-player.positionY-100,180,20)
    fill("red")
    rect(width/2-100,height-player.positionY-100,player.fuel,20)
    pop()
  }

  showCoinsbar(){
    push()
    image(lifeImage,width/2-130,height-player.positionY-140,20,20)
    fill("white")
    rect(width/2-100,height-player.positionY-140,180,20)
    fill("yellow")
    rect(width/2-100,height-player.positionY-140,player.life,20)
    pop()
  }
}
