class Snake {
    constructor(unitSize) {
        this.unitSize = unitSize;
        this.snake = [
            {x: this.unitSize*4, y: 0},
            {x: this.unitSize*3, y: 0},
            {x: this.unitSize*2, y: 0},
            {x: this.unitSize, y: 0},
            {x: 0, y: 0},
        ];
        this.collided = false;
    }

    draw(ctx) {
        ctx.fillStyle='yellow';
        ctx.strokeStyle ='black';
        ctx.fillRect(this.snake[0].x, this.snake[0].y, this.unitSize,  this.unitSize);
        ctx.strokeRect(this.snake[0].x, this.snake[0].y, this.unitSize,  this.unitSize);
        ctx.fillStyle='green';
        for (var i = 1; i < this.snake.length; i++) {
            ctx.fillRect(this.snake[i].x, this.snake[i].y, this.unitSize,  this.unitSize);
            ctx.strokeRect(this.snake[i].x, this.snake[i].y, this.unitSize,  this.unitSize);
        }
    }

    move(xSpeed, ySpeed) {
        // Lưu vị trí của đầu rắn
        const head = {
            x: this.snake[0].x + xSpeed,
            y: this.snake[0].y + ySpeed
        };

        // Thêm đầu mới vào đầu của mảng snake
        this.snake.unshift(head);

        // Xóa phần đuôi của con rắn
        this.snake.pop();
    }

    // Kiểm tra va chạm với tường hoặc với chính nó
    checkCollision(width, height) {
        const head = this.snake[0];

        // Kiểm tra va chạm với tường
        if (head.x < 0 || head.x >= width || head.y < 0 || head.y >= height) {
            this.collided = true;
            return;
        }

        // Kiểm tra va chạm với chính nó
        for (let i = 1; i < this.snake.length; i++) {
            if (head.x === this.snake[i].x && head.y === this.snake[i].y) {
                this.collided = true;
                return;
            }
        }

        this.collided = false;
    }

    // Thêm phần đuôi khi ăn thức ăn
    grow() {
        const tail = this.snake[this.snake.length - 1];
        this.snake.push({ x: tail.x, y: tail.y });
    }
}

class Food {
    constructor(unitSize, gameBoardWidth, gameBoardHeight, snake) {
        this.unitSize = unitSize;
        this.gameBoardWidth = gameBoardWidth;
        this.gameBoardHeight = gameBoardHeight;
        this.foodObject = {};
        this.snake = snake; // Lưu đối tượng con rắn
    }

    createFood() {
        let newFood;
        do {
            var x = Math.floor(Math.random() * ((this.gameBoardWidth - this.unitSize) / this.unitSize)) * this.unitSize;
            var y = Math.floor(Math.random() * ((this.gameBoardHeight - this.unitSize) / this.unitSize)) * this.unitSize;
            newFood = { x, y };
        } while (this.isFoodOnSnake(newFood, this.snake.snake)); // Truyền mảng đối tượng con rắn vào hàm kiểm tra
        this.foodObject = newFood;
    }

    isFoodOnSnake(food, snake) {
        for (var i = 0; i < snake.length; i++) {
            if (snake[i].x === food.x && snake[i].y === food.y) {
                return true;
            }
        }
        return false;
    }


}

class Barrier {
    constructor(unitSize, gameBoardWidth, gameBoardHeight, snake, food) {
        this.unitSize = unitSize;
        this.gameBoardWidth = gameBoardWidth;
        this.gameBoardHeight = gameBoardHeight;
        this.barriers = []; // Danh sách các chướng ngại vật
        this.snake = snake; // Truyền vào đối tượng snake
        this.food = food; // Truyền vào đối tượng food
        this.boom = [];
        this.createBarriers(); // Khởi tạo các chướng ngại vật ban đầu
    }

    createBarriers() {
        for (let i = 0; i < 15; i++) {
            let x, y;
            do {
                x = Math.floor(Math.random() * ((this.gameBoardWidth - this.unitSize) / this.unitSize)) * this.unitSize;
                y = Math.floor(Math.random() * ((this.gameBoardHeight - this.unitSize) / this.unitSize)) * this.unitSize;
            } while (this.isBarrierCollidedWithSnake({ x, y })); // Kiểm tra xem vị trí mới của chướng ngại vật có trùng với con rắn không
            this.barriers.push({ x, y });
        }
    }

    isBarrierCollidedWithSnake(barrier) {
        // Kiểm tra xem vị trí mới của chướng ngại vật có trùng với các phần của rắn không
        for (let i = 0; i < this.snake.snake.length; i++) {
            if (barrier.x === this.snake.snake[i].x && barrier.y === this.snake.snake[i].y) {
                return true;
            }
        }
        return false;
    }

    draw(ctx) {
        ctx.fillStyle = 'red';
        for (let i = 0; i < this.barriers.length; i++) {
            ctx.fillRect(this.barriers[i].x, this.barriers[i].y, this.unitSize, this.unitSize);
        }
    }

    createBoom() {
        for (let i = 0; i < 8; i++) {
            let x, y;
            do {
                x = Math.floor(Math.random() * ((this.gameBoardWidth - this.unitSize) / this.unitSize)) * this.unitSize;
                y = Math.floor(Math.random() * ((this.gameBoardHeight - this.unitSize) / this.unitSize)) * this.unitSize;
            } while (this.isBarrierCollidedWithSnake({ x, y }));
            this.boom.push({ x, y });
        }
    }
}



class Game {
    constructor() {
        this.gameBoard = document.getElementById("board");
        this.ctx = this.gameBoard.getContext("2d");
        this.unitSize = 20;
        this.xSpeed = this.unitSize;
        this.score = 0;
        this.running = true;
        this.ySpeed = 0;
        this.snake = new Snake(this.unitSize); // Tạo đối tượng Snake trước
        this.food = new Food(this.unitSize, this.gameBoard.width, this.gameBoard.height, this.snake); // Truyền đối tượng Snake vào Food
        this.barrier = new Barrier(this.unitSize, this.gameBoard.width, this.gameBoard.height, this.snake, this.food);
        this.setupEventListeners();
        this.paused = false;
        this.start();
    }

    pause() {
        this.paused = true;
    }

    resume() {
        this.paused = false;
        this.nextTick();
    }

    setupEventListeners() {
        document.addEventListener("DOMContentLoaded", () => {
            document.addEventListener("keydown", (e) => {
                this.changeDirection(e.key);
            });
        });
    }
   //5.5.1	Game Start (Con rắn sẽ di chuyển theo 1 hướng ngẫu nhiên).
    start() {
        this.food.createFood();
        this.barrier.createBoom(); // Thêm lệnh này để tạo ra các nấm
        this.drawFood();
        this.drawSnake();
        this.nextTick();
    }

    //5.5.2	Người chơi nhấn các nút Up, Down, Left, Right.
    //5.5.3	Hệ thống xác nhận trạng thái và xác định hướng sẽ đổi.
    changeDirection(direction) {
        var key = direction;
        var goingUp = this.ySpeed === -this.unitSize;
        var goingDown = this.ySpeed === this.unitSize;
        var goingLeft = this.xSpeed === -this.unitSize;
        var goingRight = this.xSpeed === this.unitSize;
    //5.5.4 Nếu con rắn đang di chuyển theo hướng trước đó thì sẽ chuyển sang hướng tương ứng đã chọn.
        if (key === "ArrowUp" && !goingDown) {
            this.xSpeed = 0;
            this.ySpeed = -this.unitSize;
        }
        if (key === "ArrowDown" && !goingUp) {
            this.xSpeed = 0;
            this.ySpeed = this.unitSize;
        }
        if (key === "ArrowLeft" && !goingRight) {
            this.xSpeed = -this.unitSize;
            this.ySpeed = 0;
        }
        if (key === "ArrowRight" && !goingLeft) {
            this.xSpeed = this.unitSize;
            this.ySpeed = 0;
        }
    }

    nextTick() {
        if (!this.paused && this.running) {
            this.level();
        }
    }

    level() {

        if(this.score <=5){
            setTimeout(() => {
                this.clearGameBoard();
                this.drawFood();
                this.moveSnake();
                this.drawSnake();
                this.checkCollision();
                this.nextTick();
            }, 370);
        }
        else if(this.score >5 && this.score <=10){
            setTimeout(() => {
                this.clearGameBoard();
                this.drawFood();
                this.moveSnake();
                this.drawSnake();
                this.checkCollision();
                this.nextTick();
            }, 350);
        }
        else if(this.score >10 && this.score <=15){
            setTimeout(() => {
                this.clearGameBoard();
                this.drawFood();
                this.moveSnake();
                this.drawSnake();
                this.drawBarrier();
                this.checkBarrierCollision();
                this.checkCollision();
                this.nextTick();
            }, 300);
        }
        else if(this.score >15 && this.score <=20){
            setTimeout(() => {
                this.clearGameBoard();
                this.drawFood();
                this.moveSnake();
                this.drawSnake();
                this.drawBoom();
                this.checkSnakeOnBoom();
                this.checkCollision();
                this.nextTick();
            }, 250);
        }
    }

    drawFood() {
        this.ctx.beginPath();
        this.ctx.arc(this.food.foodObject.x + this.unitSize / 2, this.food.foodObject.y + this.unitSize / 2, this.unitSize / 2, 0, Math.PI * 2);
        this.ctx.fillStyle = '#8e09ba';
        this.ctx.fill();
        this.ctx.closePath();
    }
    drawBarrier() {
        this.barrier.draw(this.ctx);
    }
    drawSnake() {
        this.snake.draw(this.ctx);
    }

    drawBoom() {
        for (var i = 0; i < this.barrier.boom.length; i++) {
            var mushroomImage = new Image();
            mushroomImage.src = 'Boom.png'; // Đường dẫn của hình ảnh nấm

            // Lưu trữ giá trị của i trong một biến trung gian để sử dụng trong hàm onload
            var index = i;

            // Chờ cho hình ảnh được tải trước khi vẽ
            if (mushroomImage.complete) {
                this.ctx.drawImage(mushroomImage, this.barrier.boom[index].x, this.barrier.boom[index].y, this.unitSize, this.unitSize);
            } else {
                // Nếu hình ảnh chưa được tải, bạn có thể thực hiện vẽ khi nó được tải xong
                mushroomImage.onload = function() {
                    this.ctx.drawImage(mushroomImage, this.barrier.boom[index].x, this.barrier.boom[index].y, this.unitSize, this.unitSize);
                }.bind(this); // Sử dụng bind để đảm bảo rằng "this" ở đây đề cập đến đối tượng Game
            }
        }
    }






    moveSnake() {
        this.snake.move(this.xSpeed, this.ySpeed);

        // Kiểm tra xem con rắn có ăn thức ăn không
        if (this.snake.snake[0].x === this.food.foodObject.x && this.snake.snake[0].y === this.food.foodObject.y) {
            this.score++;
            document.getElementById("score").innerText = this.score;
            this.food.createFood();
            this.snake.grow(); // Thêm phần đuôi của con rắn
        }
    }

    checkCollision() {
        this.snake.checkCollision(this.gameBoard.width, this.gameBoard.height);
        if (this.snake.collided) {
            this.running = false;
            this.displayGameOver();
        }
    }
    checkBarrierCollision() {
        const head = this.snake.snake[0];

        // Kiểm tra xem đầu của con rắn có chạm vào bất kỳ chướng ngại vật nào hay không
        for (let i = 0; i < this.barrier.barriers.length; i++) {
            if (head.x === this.barrier.barriers[i].x && head.y === this.barrier.barriers[i].y) {
                this.running = false;
                this.displayGameOver();
                return;
            }
        }
    }


    checkSnakeOnBoom(){
        const head = this.snake.snake[0];
        for (let i = 0; i < this.barrier.boom.length; i++) {
            if (head.x === this.barrier.boom[i].x && head.y === this.barrier.boom[i].y) {
                // Loại bỏ nửa phần đuôi của con rắn
                const halfSnakeLength = Math.floor(this.snake.snake.length / 2);
                for (let j = 0; j < halfSnakeLength; j++) {
                    this.snake.snake.pop();
                }

                // Kiểm tra độ dài của con rắn
                if (this.snake.snake.length < 5) { // Giả sử độ dài ban đầu của con rắn là 5
                    // Game over
                    this.running = false;
                    this.displayGameOver();
                }

                break; // Kết thúc vòng lặp khi tìm thấy va chạm
            }
        }
    }



    displayGameOver() {
        this.ctx.font = "30px MV Boli";
        this.ctx.fillStyle = "Black";
        this.ctx.textAlign = "center";
        this.ctx.fillText("GAME OVER!", this.gameBoard.width / 2, this.gameBoard.height / 2);
    }

    clearGameBoard() {
        this.ctx.fillStyle = 'white';
        this.ctx.fillRect(0, 0, this.gameBoard.width, this.gameBoard.height);
    }
}

// Bắt đầu trò chơi
const game = new Game();






// jqery
document.getElementById("paus").addEventListener("click", () => {
    game.pause();
});
document.getElementById("continue").addEventListener("click", () => {
    game.resume();
});

$(document).ready(function(){
    $('#intrusct').click(function(){
        $('#popup').css('display', 'block');
    });

    $('.fa-x').click(function(){
        $('#popup').css('display', 'none');
    });
});



$(document).ready(function (){

    $("#start").click(function (){
        $("#start1").css({"display": "flex"}); // Hiển thị #start1 trước khi reload
        localStorage.setItem('start1Visible', 'true'); // Lưu trạng thái của #start1 vào localStorage
        localStorage.setItem('selectVisible', 'false');
        location.reload();
    });

    $("#intrusct").click(function () {
        $("#popup").css({  "opacity": "1", "pointer-events": "all"});
    });

    $("#popup").click(function () {
        $("#popup").css({  "opacity": "0", "pointer-events": "none"});
    });

    $(".fa-solid").click(function () {
        $("#popup").css({  "opacity": "0", "pointer-events": "none"});
    });
});




// // level3
//
// var snake3 = [
//     {x:unitSize*4, y:0},
//     {x:unitSize*3, y:0},
//     {x:unitSize*2, y:0},
//     {x:unitSize, y:0},
//     {x:0, y:0},
// ];
//
// function drawSnake3(){
//     ctx.fillStyle='yellow';
//     ctx.strokeStyle ='black';
//     ctx.fillRect(snake3[0].x, snake3[0].y, unitSize,  unitSize);
//     ctx.strokeRect(snake3[0].x, snake3[0].y, unitSize,  unitSize);
//     ctx.fillStyle='green';
//     for (var i = 1; i<snake3.length; i++){
//         ctx.fillRect(snake3[i].x, snake3[i].y, unitSize,  unitSize);
//         ctx.strokeRect(snake3[i].x, snake3[i].y, unitSize,  unitSize);
//     }
//
// }
//
// function start3() {
//     createFood3(); // Tạo thức ăn
//     drawFood(); // Vẽ thức ăn
//     createOb(); // Tạo vật cản
//     drawOb(); // Vẽ vật cản
//     drawSnake3(); // Vẽ con rắn
//     xSpeed = unitSize; // Thiết lập hướng di chuyển ban đầu cho con rắn theo chiều ngang
//     ySpeed = 0;
//     nextTick3();
//     // Bắt đầu cập nhật vị trí của các vật cản sau mỗi khoảng thời gian nhất định
//     setInterval(updateObstaclePositions, 20000);
// }
// function createFood3() {
//     var newFood;
//     do {
//         // Tạo vị trí ngẫu nhiên cho thức ăn
//         var x = Math.floor(Math.random() * ((gameBoard.width - unitSize) / unitSize)) * unitSize;
//         var y = Math.floor(Math.random() * ((gameBoard.height - unitSize) / unitSize)) * unitSize;
//         newFood = {x, y};
//     } while (isFoodOnSnake3(newFood) || isFoodOnObstacle(newFood) ); // Kiểm tra nếu thức ăn mới trùng với con rắn
//     foodObject = newFood;
// }
//
// function isFoodOnSnake3(foodObject) {
//     // Kiểm tra xem thức ăn mới có trùng với bất kỳ phần nào của con rắn không
//     for (var i = 0; i < snake3.length; i++) {
//         if (snake3[i].x === foodObject.x && snake3[i].y === foodObject.y) {
//             return true;
//         }
//     }
//     return false;
// }
// function checkGameOver3() {
//
//     // Kiểm tra xem phần đầu của con rắn có đụng vào bất kỳ phần nào của con rắn cũ không
//     for (var j = 0; j < snake3.length; j++) {
//         for (var k = 0; k < snake3.length; k++) {
//             if (snake3[j].x === snake3[k].x && snake3[j].y === snake3[k].y && j !== k) {
//                 displayGameOver(); // Trả về true nếu phần đầu của con rắn đụng vào phần thân của con rắn cũ
//                 running = false;
//             }
//         }
//     }
//
//     // Cập nhật giá trị của các biến kiểm tra va chạm với biên
//     touchUp = snake3[0].y < 0;
//     touchDown = snake3[0].y > gameBoard.height - unitSize;
//     touchLeft = snake3[0].x < 0;
//     touchRight = snake3[0].x > gameBoard.width - unitSize;
//     // Kiểm tra va chạm với biên
//     if (touchUp || touchRight || touchDown || touchLeft) {
//         running = false;
//         displayGameOver();
//
//     }
//
//     for (var i = 0; i < obstacle.length; i++) {
//         if(snake3[0].x === obstacle[i].x && snake3[0].y === obstacle[i].y){
//             running = false;
//             displayGameOver();
//         }
//     }
// }
//
// var obstacle = []; // Mảng lưu trữ các vật cản
// function createOb() {
//     for (var i = 0; i < 10; i++) {
//         var newObstacle;
//         do {
//             var x = Math.floor(Math.random() * ((gameBoard.width - unitSize) / unitSize)) * unitSize;
//             var y = Math.floor(Math.random() * ((gameBoard.height - unitSize) / unitSize)) * unitSize;
//             newObstacle = { x, y };
//         } while (isObstacleOnSnake(newObstacle) || isFoodOnObstacle(newObstacle) || isUpdateObsOnFood(newObstacle)); // Kiểm tra xem vật cản mới không trùng với con rắn hoặc thức ăn
//         obstacle[i] = newObstacle; // Gán vật cản mới vào vị trí thứ i trong mảng
//     }
// }
// function updateObstaclePositions() {
//     for (var i = 0; i < obstacle.length; i++) {
//         var newX, newY;
//         var newObstacle;
//         do {
//             newX = Math.floor(Math.random() * ((gameBoard.width - unitSize) / unitSize)) * unitSize;
//             newY = Math.floor(Math.random() * ((gameBoard.height - unitSize) / unitSize)) * unitSize;
//             newObstacle = {x: newX, y: newY};
//         } while (isObstacleOnSnake(newObstacle) || isFoodOnObstacle(newObstacle) || isUpdateObsOnFood(newObstacle)); // Kiểm tra xem vị trí mới có trùng với con rắn hoặc thức ăn không
//         obstacle[i].x = newX;
//         obstacle[i].y = newY;
//     }
// }
//
//
// function isObstacleOnSnake(obstacle) {
//     // Kiểm tra xem vật cản có trùng với con rắn không
//     for (var i = 0; i < snake3.length; i++) {
//         if ( obstacle.x  ===  snake3[i].x &&  obstacle.y  === snake3[i].y) {
//             return true;
//         }
//     }
//     return false;
// }
//
// function isFoodOnObstacle(foodObject) {
//     // Kiểm tra xem vị trí của thức ăn có trùng với vật cản không
//     for (var i = 0; i < obstacle.length; i++) {
//         if (foodObject.x === obstacle[i].x && foodObject.y === obstacle[i].y) {
//             return true;
//         }
//     }
//     return false;
// }
// function isUpdateObsOnFood(obs) {
//     // Kiểm tra xem vị trí của vật cản có trùng với thức ăn không
//     if (foodObject.x === obs.x && foodObject.y === obs.y) {
//         return true;
//     }
//
//     return false;
// }
//
// function drawOb() {
//     ctx.fillStyle = 'gray';
//     for (var i = 0; i < obstacle.length; i++) {
//         ctx.fillRect(obstacle[i].x, obstacle[i].y, unitSize, unitSize);
//     }
// }
//
// function moveSnake3() {
//     var head = {
//         x: snake3[0].x + xSpeed,
//         y: snake3[0].y + ySpeed
//     };
//
//     snake3.unshift(head);
//
//
//     // Kiểm tra xem con rắn có ăn thức ăn không
//     if (snake3[0].x === foodObject.x && snake3[0].y === foodObject.y) {
//         score++;
//         document.getElementById("score").innerText = score;
//         createFood3();
//     } else {
//         snake3.pop();
//     }
// }
//
// function level3() {
//     if (score <= 5) {
//         setTimeout(() => {
//             clearGameBoard();
//             drawFood();
//             drawOb();
//             moveSnake3();
//             drawSnake3();
//             checkGameOver3();
//             nextTick3();
//
//         }, 350);
//     } else if (score > 5 && score <= 10) {
//         setTimeout(() => {
//             clearGameBoard();
//             drawFood();
//             drawOb();
//             moveSnake3();
//             drawSnake3();
//             checkGameOver3();
//             nextTick3();
//         }, 300);
//     }
//     else if(score>10 && score<=15){
//         setTimeout(() => {
//             clearGameBoard()
//             drawFood();
//             drawOb();
//             moveSnake3();
//             drawSnake3();
//             checkGameOver3();
//             nextTick3();
//         }, 220)
//     }
//     else if(score>15 && score<=20){
//         setTimeout(() => {
//             clearGameBoard()
//             drawFood();
//             drawOb();
//             moveSnake3();
//             drawSnake3();
//             checkGameOver3();
//             nextTick3();
//         }, 150)
//     }
//
//     else if(score>20){
//         score = 0;
//         document.getElementById("score").innerText = score;
//         completeLevels3();
//
//     }
// }
//
// function nextTick3() {
//     if (running) {
//         level3();
//     } else {
//         displayGameOver();
//     }
// }
//
//
// // hoàn thành trò chơi
// function completeLevels3() {
//     clearGameBoard();
//     var message = "Chúc mừng bạn đã vượt qua vòng 3! " + "Vòng 4 sẽ bắt đầu sau vài giây" ;
//     ctx.font = "30px MV Boli";
//     ctx.fillStyle = "Black";
//     ctx.textAlign = "center";
//
//     // Phân tách thông điệp thành các dòng nếu nó quá dài
//     var maxWidth = gameBoard.width * 0.8; // Giới hạn chiều rộng của văn bản là 80% chiều rộng của bảng
//     var lineHeight = 35; // Độ cao của mỗi dòng
//     var words = message.split(' ');
//     var line = '';
//     var y = gameBoard.height / 2; // Vị trí dọc của văn bản
//
//     for (var i = 0; i < words.length; i++) {
//         var testLine = line + words[i] + ' ';
//         var metrics = ctx.measureText(testLine);
//         var testWidth = metrics.width;
//         if (testWidth > maxWidth && i > 0) {
//             ctx.fillText(line, gameBoard.width / 2, y);
//             line = words[i] + ' ';
//             y += lineHeight;
//         } else {
//             line = testLine;
//         }
//     }
//     ctx.fillText(line, gameBoard.width / 2, y);
//     setTimeout(()=>{
//         start4();
//     }, 5000)
// }
//
//
//
//
// // levels 4
//
// var snake4 = [
//     {x:unitSize*4, y:0},
//     {x:unitSize*3, y:0},
//     {x:unitSize*2, y:0},
//     {x:unitSize, y:0},
//     {x:0, y:0},
// ];
//
// function drawSnake4(){
//     ctx.fillStyle='yellow';
//     ctx.strokeStyle ='black';
//     ctx.fillRect(snake4[0].x, snake4[0].y, unitSize,  unitSize);
//     ctx.strokeRect(snake4[0].x, snake4[0].y, unitSize,  unitSize);
//     ctx.fillStyle='green';
//     for (var i = 1; i<snake4.length; i++){
//         ctx.fillRect(snake4[i].x, snake4[i].y, unitSize,  unitSize);
//         ctx.strokeRect(snake4[i].x, snake4[i].y, unitSize,  unitSize);
//     }
//
// }
// function start4(){
//     createOb4(); // Tạo vật cản
//     createApple();
//     createObs();
//     drawSnake4();
//     xSpeed = unitSize; // Thiết lập hướng di chuyển ban đầu cho con rắn theo chiều ngang
//     ySpeed = 0;
//     nextTick4();
//     setInterval(updateObstaclePositions4, 15000); // 10000 milliseconds = 15s
// }
// function updateObstaclePositions4() {
//     for (var i = 0; i < boom.length; i++) {
//         var newX, newY;
//         var newObstacle;
//         do {
//             newX = Math.floor(Math.random() * ((gameBoard.width - unitSize) / unitSize)) * unitSize;
//             newY = Math.floor(Math.random() * ((gameBoard.height - unitSize) / unitSize)) * unitSize;
//             newObstacle = {x: newX, y: newY};
//         } while (isObstacleOnSnake4(newObstacle) || isAppleOnFood(newObstacle)||isOb(newObstacle) || isboom(newObstacle)); // Kiểm tra xem vị trí mới có trùng với con rắn hoặc thức ăn không
//         boom[i].x = newX;
//         boom[i].y = newY;
//     }
// }
//
//
// var boom  = [15];
// function createOb4() {
//     for (var i = 0; i < 10; i++) {
//         var newObstacle;
//         do {
//             var x = Math.floor(Math.random() * ((gameBoard.width - unitSize) / unitSize)) * unitSize;
//             var y = Math.floor(Math.random() * ((gameBoard.height - unitSize) / unitSize)) * unitSize;
//             newObstacle = { x, y };
//         } while (isObstacleOnSnake4(newObstacle) || isAppleOnFood(newObstacle) || isOb(newObstacle) || isboom(newObstacle)); // Kiểm tra xem vật cản mới không trùng với con rắn hoặc thức ăn
//         boom[i] = newObstacle; // Gán vật cản mới vào vị trí thứ i trong mảng
//     }
// }
// function isObstacleOnSnake4(obs) {
//     // Kiểm tra xem vật cản có trùng với con rắn không
//     for (var i = 0; i < snake4.length; i++) {
//         if ( obs.x  ===  snake4[i].x &&  obs.y  === snake4[i].y) {
//             return true;
//         }
//     }
//     return false;
// }
//
// function isAppleOnFood(apple){
//     for (var i = 0; i < ob.length; i++) {
//         if(apple.x === ob[i].x && apple.y === ob[i].y){
//             return true;
//         }
//     }
//     return false;
// }
//
// function isboom(ob){
//     for (var i = 0; i < boom.length; i++) {
//         if(ob.x === boom[i].x && ob.y === boom[i].y){
//             return true;
//         }
//     }
//     return false;
// }
//
// function isOb(obstacle){
//     for (var i = 0; i < Apple.length; i++) {
//         if(obstacle.x === Apple[i].x  && obstacle.y  ===  Apple[i].y){
//             return true;
//         }
//     }
//     return false;
// }
//
//
// var ob = [];
// function createObs() {
//     for (var i = 0; i < 7; i++) {
//         var newObstacle;
//         do {
//             var x = Math.floor(Math.random() * ((gameBoard.width - unitSize) / unitSize)) * unitSize;
//             var y = Math.floor(Math.random() * ((gameBoard.height - unitSize) / unitSize)) * unitSize;
//             newObstacle = { x, y };
//         } while (isObstacleOnSnake4(newObstacle) || isAppleOnFood(newObstacle) || isOb(newObstacle) || isboom(newObstacle)); // Kiểm tra xem vật cản mới không trùng với con rắn hoặc thức ăn
//         ob[i] = newObstacle; // Gán vật cản mới vào vị trí thứ i trong mảng
//     }
// }
//
// function drawObs() {
//     for (var i = 0; i < ob.length; i++) {
//         ctx.fillStyle = 'rgba(120,16,162,0.96)'; // Chọn màu cho vật cản
//         ctx.fillRect(ob[i].x, ob[i].y, unitSize, unitSize); // Vẽ hình vuông
//     }
// }
//
//
//
// var Apple = [];
// function createApple(){
//     for (var i = 0; i <4; i++) {
//         var newApple;
//         do{
//             var x = Math.floor(Math.random() * ((gameBoard.width - unitSize) / unitSize)) * unitSize;
//             var y = Math.floor(Math.random() * ((gameBoard.height - unitSize) / unitSize)) * unitSize;
//             newApple = { x, y };
//
//         } while (isObstacleOnSnake4(newApple) || isAppleOnFood(newApple) || isOb(newApple)|| isboom(newApple));
//         Apple[i] = newApple;
//     }
// }
// function drawApple(){
//     for (var i = 0; i < Apple.length; i++) {
//         var appleImage = new Image();
//         appleImage.src = 'Apple.png'; // Đường dẫn của hình ảnh quả táo
//
//         // Chờ cho hình ảnh được tải trước khi vẽ
//         if (appleImage.complete) {
//             ctx.drawImage(appleImage, Apple[i].x, Apple[i].y, unitSize, unitSize);
//         } else {
//             // Nếu hình ảnh chưa được tải, bạn có thể thực hiện vẽ khi nó được tải xong
//             appleImage.onload = function() {
//                 ctx.drawImage(appleImage, Apple[i].x, Apple[i].y, unitSize, unitSize);
//             }
//         }
//     }
// }
// function drawOb4() {
//     for (var i = 0; i < boom.length; i++) {
//         var appleImage = new Image();
//         appleImage.src = 'bomb.png'; // Đường dẫn của hình ảnh quả táo
//
//         // Chờ cho hình ảnh được tải trước khi vẽ
//         if (appleImage.complete) {
//             ctx.drawImage(appleImage, boom[i].x, boom[i].y, unitSize, unitSize);
//         } else {
//             // Nếu hình ảnh chưa được tải, bạn có thể thực hiện vẽ khi nó được tải xong
//             appleImage.onload = function() {
//                 ctx.drawImage(appleImage, boom[i].x, boom[i].y, unitSize, unitSize);
//             }
//         }
//     }
// }
//
// function moveSnake4() {
//     var head = {
//         x: snake4[0].x + xSpeed,
//         y: snake4[0].y + ySpeed
//     };
//
//     // Kiểm tra va chạm với quả táo
//     var ateApple = false;
//     for (var i = 0; i < Apple.length; i++) {
//         if (snake4[0].x === Apple[i].x && snake4[0].y === Apple[i].y) {
//             score += 2;
//             document.getElementById("score").innerText = score;
//
//             // Thêm 2 ô vào phần thân của con rắn
//             for (var j = 0; j < 1; j++) {
//                 var tail = snake4[snake4.length - 1]; // Lấy phần đuôi của con rắn
//                 snake4.push({ x: tail.x, y: tail.y }); // Thêm 1 ô mới
//             }
//
//             ateApple = true;
//
//             clearApple();
//         }
//     }
//
//     // Kiểm tra va chạm với các vật cản
//     var hitObstacle = false;
//     for (var i = 0; i < boom.length; i++) {
//         if (snake4[0].x === boom[i].x && snake4[0].y === boom[i].y) {
//             clearOb4();
//             hitObstacle = true;
//             break; // Kết thúc vòng lặp ngay khi gặp vật cản
//         }
//     }
//
//     if (hitObstacle) {
//         if (snake4.length > 4) {
//             // Giảm độ dài của con rắn một nửa
//             snake4.splice(snake4.length / 2);
//         }
//         if (snake4.length <= 4) {
//             running = false;
//             displayGameOver();
//             return; // Thoát khỏi hàm nếu game over
//         }
//     }
//
//     // Nếu không ăn được quả táo, loại bỏ phần đuôi của con rắn
//     if (!ateApple) {
//         snake4.pop();
//     }
//
//     // Đẩy đầu của con rắn vào vị trí mới
//     snake4.unshift(head);
// }
// function clearOb4() {
//     for (var i = 0; i < boom.length; i++) {
//         if (snake4[0].x === boom[i].x && snake4[0].y === boom[i].y) {
//             boom[i] = {}; // Xóa quả táo đã ăn
//             // Tạo quả táo mới tại vị trí ngẫu nhiên và không trùng với rắn hoặc quả táo cũ
//             var newApple;
//             do {
//                 var x = Math.floor(Math.random() * ((gameBoard.width - unitSize) / unitSize)) * unitSize;
//                 var y = Math.floor(Math.random() * ((gameBoard.height - unitSize) / unitSize)) * unitSize;
//                 newApple = { x, y };
//             } while (isObstacleOnSnake(newApple) || isAppleOnFood(newApple));
//             boom[i] = newApple;
//         }
//     }
// }
//
// function clearApple() {
//     for (var i = 0; i < Apple.length; i++) {
//         if (snake4[0].x === Apple[i].x && snake4[0].y === Apple[i].y) {
//             Apple[i] = {}; // Xóa quả táo đã ăn
//             // Tạo quả táo mới tại vị trí ngẫu nhiên và không trùng với rắn hoặc quả táo cũ
//             var newApple;
//             do {
//                 var x = Math.floor(Math.random() * ((gameBoard.width - unitSize) / unitSize)) * unitSize;
//                 var y = Math.floor(Math.random() * ((gameBoard.height - unitSize) / unitSize)) * unitSize;
//                 newApple = { x, y };
//             } while (isObstacleOnSnake(newApple) || isAppleOnFood(newApple));
//             Apple[i] = newApple;
//         }
//     }
// }
//
//
// function nextTick4() {
//     if (running) {
//         level4();
//     } else {
//         displayGameOver();
//     }
// }
// function checkGameOver4(){
//     // Cập nhật giá trị của các biến kiểm tra va chạm với biên
//     touchUp = snake4[0].y < 0;
//     touchDown = snake4[0].y > gameBoard.height - unitSize;
//     touchLeft = snake4[0].x < 0;
//     touchRight = snake4[0].x > gameBoard.width - unitSize;
//     // Kiểm tra va chạm với biên
//     if (touchUp || touchRight || touchDown || touchLeft) {
//         running = false;
//     }
//     var head = snake4[0];
//     // Kiểm tra va chạm với thân con rắn (trừ đầu)
//     for (var i = 1; i < snake4.length; i++) {
//         if (head.x === snake4[i].x && head.y === snake4[i].y) {
//             running = false; // Game over nếu đầu của con rắn trùng với một phần thân khác
//             return;
//         }
//     }
//
//
//
//     // Kiểm tra va chạm với vật cản
//     for (var i = 0; i < ob.length; i++) {
//         if (snake4[0].x === ob[i].x && snake4[0].y === ob[i].y) {
//             running = false;
//             displayGameOver();
//         }
//     }
//
// }
//
// function level4() {
//     if (score <= 5) {
//         setTimeout(() => {
//             clearGameBoard();
//             drawOb4();
//             drawApple();
//             drawObs();
//             moveSnake4();
//             drawSnake4();
//             checkGameOver4();
//             nextTick4();
//         }, 350);
//     }
//     else if (score > 5 && score <= 10) {
//         setTimeout(() => {
//             clearGameBoard();
//             drawOb4();
//             drawApple();
//             drawObs();
//             moveSnake4();
//             drawSnake4();
//             checkGameOver4();
//             nextTick4();
//         }, 300);
//     }
//     else if(score>10 && score<=15){
//         setTimeout(() => {
//             clearGameBoard()
//             drawOb4();
//             drawApple();
//             drawObs();
//             moveSnake4();
//             drawSnake4();
//             checkGameOver4();
//             nextTick4();
//         }, 250)
//     }
//     else if(score>15 && score<=20){
//         setTimeout(() => {
//             clearGameBoard()
//             drawOb4();
//             drawApple();
//             drawObs();
//             moveSnake4();
//             drawSnake4();
//             checkGameOver4();
//             nextTick4();
//         }, 200)
//     }
//     else if(score>20 && score<=25){
//         setTimeout(() => {
//             clearGameBoard()
//             drawOb4();
//             drawApple();
//             drawObs();
//             moveSnake4();
//             drawSnake4();
//             checkGameOver4();
//             nextTick4();
//         }, 150)
//     }
//     else if(score>25 && score<=30){
//         setTimeout(() => {
//             clearGameBoard()
//             drawOb4();
//             drawApple();
//             drawObs();
//             moveSnake4();
//             drawSnake4();
//             checkGameOver4();
//             nextTick4();
//         }, 100)
//     }
//     else if(score>30 && score<=35){
//         setTimeout(() => {
//             clearGameBoard()
//             drawOb4();
//             drawApple();
//             drawObs();
//             moveSnake4();
//             drawSnake4();
//             checkGameOver4();
//             nextTick4();
//         }, 100)
//     }
//     else if(score>35 && score<=40){
//         setTimeout(() => {
//             clearGameBoard()
//             drawOb4();
//             drawApple();
//             drawObs();
//             moveSnake4();
//             drawSnake4();
//             checkGameOver4();
//             nextTick4();
//         }, 100)
//     }
//     else if(score>40 && score<=45){
//         setTimeout(() => {
//             clearGameBoard()
//             drawOb4();
//             drawApple();
//             drawObs();
//             moveSnake4();
//             drawSnake4();
//             checkGameOver4();
//             nextTick4();
//         }, 100)
//     }
//     else if(score>45 && score<=50){
//         setTimeout(() => {
//             clearGameBoard()
//             drawOb4();
//             drawApple();
//             drawObs();
//             moveSnake4();
//             drawSnake4();
//             checkGameOver4();
//             nextTick4();
//         }, 100)
//     }
//
//     else if(score>50){
//         score = 0;
//         document.getElementById("score").innerText = score;
//         completeLevels4();
//     }
//
//
//
// }
//
//
// // hoàn thành trò chơi
// function completeLevels4() {
//     clearGameBoard();
//     var message = "Chúc mừng bạn đã vượt qua vòng 4! " + "Vòng 5 sẽ bắt đầu sau vài giây" ;
//     ctx.font = "30px MV Boli";
//     ctx.fillStyle = "Black";
//     ctx.textAlign = "center";
//
//     // Phân tách thông điệp thành các dòng nếu nó quá dài
//     var maxWidth = gameBoard.width * 0.8; // Giới hạn chiều rộng của văn bản là 80% chiều rộng của bảng
//     var lineHeight = 35; // Độ cao của mỗi dòng
//     var words = message.split(' ');
//     var line = '';
//     var y = gameBoard.height / 2; // Vị trí dọc của văn bản
//
//     for (var i = 0; i < words.length; i++) {
//         var testLine = line + words[i] + ' ';
//         var metrics = ctx.measureText(testLine);
//         var testWidth = metrics.width;
//         if (testWidth > maxWidth && i > 0) {
//             ctx.fillText(line, gameBoard.width / 2, y);
//             line = words[i] + ' ';
//             y += lineHeight;
//         } else {
//             line = testLine;
//         }
//     }
//     ctx.fillText(line, gameBoard.width / 2, y);
//     setTimeout(()=>{
//         start5();
//     }, 5000)
// }
//
//
//
//
//
//
// // level5
// function start5() {
//     createFood5();
//     drawFood5();
//     drawSnake5();
//     createObstacles5(); // Vẽ các vật cản
//     drawObstacles5();
//     xSpeed = unitSize;
//     ySpeed = 0;
//     nextTick5();
// }
// // Thay đổi khởi tạo của rắn để nó bắt đầu từ bên ngoài khung
// var snake5 = [
//     {x: -unitSize, y: unitSize*4},
//     {x: -unitSize, y: unitSize*3},
//     {x: -unitSize, y: unitSize*2},
//     {x: -unitSize, y: unitSize},
//     {x: -unitSize, y: 0},
// ];
//
// function isFoodOnObstacle5(foodObject) {
//     // Kiểm tra xem thức ăn mới có trùng với bất kỳ vật cản nào không
//     for (var i = 0; i < obstacles.length; i++) {
//         if (foodObject.x === obstacles[i].x && foodObject.y === obstacles[i].y) {
//             return true;
//         }
//     }
//     return false;
// }
//
// var food5;
// function createFood5() {
//     var newFood;
//     do {
//         // Tạo vị trí ngẫu nhiên cho thức ăn
//         var x = Math.floor(Math.random() *((gameBoard.width - unitSize) / unitSize)) * unitSize;
//         var y = Math.floor(Math.random() *((gameBoard.height - unitSize) / unitSize)) * unitSize;
//         food5 = {x, y};
//         newFood = food5;
//     } while (isFoodOnSnake5(newFood) || isFoodOnObstacle5(newFood)); // Kiểm tra nếu thức ăn mới trùng với con rắn
//     food5 = newFood;
// }
//
// function isFoodOnSnake5(foodObject) {
//     // Kiểm tra xem thức ăn mới có trùng với bất kỳ phần nào của con rắn không
//     for (var i = 0; i < snake5.length; i++) {
//         if (snake5[i].x === foodObject.x && snake5[i].y === foodObject.y) {
//             return true;
//         }
//     }
//     return false;
// }
//
// function drawFood5() {
//     var img = new Image();
//     img.onload = function() {
//         ctx.drawImage(img, food5.x, food5.y, unitSize, unitSize);
//     };
//     img.src = 'Apple.png'; // Thay link bằng đường dẫn đến hình ảnh của quả táo
// }
//
//
//
//
// function drawSnake5(){
//     ctx.fillStyle='yellow';
//     ctx.strokeStyle ='black';
//     ctx.fillRect(snake5[0].x, snake5[0].y, unitSize,  unitSize);
//     ctx.strokeRect(snake5[0].x, snake5[0].y, unitSize,  unitSize);
//     ctx.fillStyle='green';
//     for (var i = 1; i<snake5.length; i++){
//         ctx.fillRect(snake5[i].x, snake5[i].y, unitSize,  unitSize);
//         ctx.strokeRect(snake5[i].x, snake5[i].y, unitSize,  unitSize);
//     }
//
// }
//
// function moveSnake5() {
//     var head = {
//         x: snake5[0].x + xSpeed,
//         y: snake5[0].y + ySpeed
//     };
//
//     // Kiểm tra xem đầu của con rắn có chạm vào biên không
//     // Nếu đầu của con rắn chạm vào biên, điều chỉnh vị trí cho phù hợp với hướng di chuyển của nó để nó di chuyển từ ngoài vào khung
//     if (head.x < 0) {
//         head.x = gameBoard.width - unitSize; // Nếu chạm biên bên trái, đặt đầu con rắn ở phía bên phải của màn hình
//     } else if (head.x >= gameBoard.width) {
//         head.x = 0; // Nếu chạm biên bên phải, đặt đầu con rắn ở phía bên trái của màn hình
//     }
//     if (head.y < 0) {
//         head.y = gameBoard.height - unitSize; // Nếu chạm biên phía trên, đặt đầu con rắn ở phía dưới màn hình
//     } else if (head.y >= gameBoard.height) {
//         head.y = 0; // Nếu chạm biên phía dưới, đặt đầu con rắn ở phía trên màn hình
//     }
//
//     snake5.unshift(head); // Di chuyển đầu mới vào con rắn
//     // Kiểm tra xem con rắn có ăn thức ăn không
//     if (snake5[0].x === food5.x && snake5[0].y === food5.y) {
//         score+=2;
//         document.getElementById("score").innerText = score;
//         createFood5();
//     }
//     // Loại bỏ phần đuôi của con rắn
//     snake5.pop();
// }
//
//
//
// // Định nghĩa các vật cản
// var obstacles = [];
//
// function createObstacles5() {
//     // Tạo 6 vật cản mới
//     for (var i = 0; i < 6; i++) {
//         var obstacle;
//         do {
//             obstacle = {
//                 x: Math.floor(Math.random() * (gameBoard.width - unitSize * 3)), // Vị trí x ngẫu nhiên
//                 y: Math.floor(Math.random() * (gameBoard.height / unitSize)) * unitSize, // Vị trí y ngẫu nhiên
//                 width: unitSize * 3, // Chiều rộng (độ dài 3 ô)
//                 height: unitSize, // Chiều cao (1 ô)
//             };
//         } while (isObstacleOnSnake5(obstacle) || isFoodOnObstacle5(obstacle)); // Kiểm tra xem vật cản mới có trùng với con rắn không
//         obstacles.push(obstacle); // Thêm vật cản mới vào mảng
//     }
// }
//
// function isObstacleOnSnake5(ob){
//     for (var i = 0 ; i < snake5.length; i++){
//         if(ob.x === snake5[i].x && ob.y === snake5[i].y){
//             return true;
//         }
//     }
//     return false;
// }
//
//
// // Hàm vẽ vật cản
// function drawObstacles5() {
//     // Duyệt qua mỗi vật cản trong mảng
//     for (var i = 0; i < obstacles.length; i++) {
//         ctx.fillStyle = 'gray'; // Màu sắc của vật cản
//         ctx.fillRect(obstacles[i].x, obstacles[i].y, obstacles[i].width, obstacles[i].height); // Vẽ vật cản
//     }
// }
//
//
// function moveObstacles() {
//     // Tốc độ di chuyển của vật cản (số pixel mỗi lần di chuyển)
//     var obstacleSpeed = 6;
//
//     // Biến kiểm tra xem vật cản đã chạm vào thức ăn hay không
//     var hitFood = false;
//
//     // Duyệt qua mỗi vật cản trong mảng
//     for (var i = 0; i < obstacles.length; i++) {
//         // Di chuyển vật cản từ trái sang phải
//         obstacles[i].x += obstacleSpeed;
//
//         // Nếu vật cản đi ra khỏi khung canvas, đặt lại vị trí ở bên trái ngoài màn hình và ngẫu nhiên vị trí y mới
//         if (obstacles[i].x > gameBoard.width) {
//             obstacles[i].x = -unitSize * 4; // Đặt vị trí bên trái ngoài màn hình
//             obstacles[i].y = Math.floor(Math.random() * (gameBoard.height / unitSize)) * unitSize; // Đặt vị trí ngẫu nhiên theo chiều dọc
//         }
//
//         // Kiểm tra vật cản có chạm vào thức ăn hay không
//         var foodCenter = {
//             x: food5.x + unitSize / 2, // Tọa độ x của trung tâm thức ăn
//             y: food5.y + unitSize / 2 // Tọa độ y của trung tâm thức ăn
//         };
//         if (foodCenter.x >= obstacles[i].x && foodCenter.x <= obstacles[i].x + obstacles[i].width &&
//             foodCenter.y >= obstacles[i].y && foodCenter.y <= obstacles[i].y + obstacles[i].height) {
//             hitFood = true;
//         }
//     }
//
//     // Nếu vật cản đã chạm vào thức ăn, tạo lại vị trí mới cho thức ăn
//     if (hitFood) {
//         createFood5();
//     }
// }
//
//
//
//
//
//
//
//
// function checkGameOver5() {
//
//
//     // Kiểm tra va chạm với thân con rắn (trừ đầu)
//     var head = snake5[0];
//     for (var i = 1; i < snake5.length; i++) {
//         if (head.x === snake5[i].x && head.y === snake5[i].y) {
//             running = false; // Game over nếu đầu của con rắn trùng với một phần thân khác
//             displayGameOver();
//             return;
//         }
//     }
//
// // Kiểm tra con rắn chạm vào vật cản
//     for (var i = 0; i < obstacles.length; i++) {
//         // Kiểm tra va chạm giữa đầu con rắn và vật cản
//         for (var j = 0; j < snake5.length; j++) {
//             var headPoint = {
//                 x: snake5[j].x + unitSize / 2, // Tọa độ x của điểm trên đầu con rắn
//                 y: snake5[j].y + unitSize / 2 // Tọa độ y của điểm trên đầu con rắn
//             };
//
//             // Kiểm tra xem điểm trên đầu con rắn có nằm trong vật cản không
//             if (headPoint.x >= obstacles[i].x && headPoint.x <= obstacles[i].x + obstacles[i].width &&
//                 headPoint.y >= obstacles[i].y && headPoint.y <= obstacles[i].y + obstacles[i].height) {
//                 running = false; // Game over nếu điểm trên đầu con rắn nằm trong vật cản
//                 displayGameOver();
//                 return;
//             }
//         }
//     }
//
//
//
//
//
//
// }
//
// function nextTick5() {
//     if (running) {
//         level5();
//     }
//     else {
//         displayGameOver();
//     }
//
// }
//
// function level5(){
//     if (score <= 5) {
//         setTimeout(() => {
//             clearGameBoard()
//             drawFood5();
//             moveSnake5();
//             drawSnake5();
//             drawObstacles5();
//             moveObstacles();
//             checkGameOver5();
//             nextTick5();
//         }, 320)
//     }
//     else if (score > 5 && score <= 10) {
//         setTimeout(() => {
//             clearGameBoard()
//             drawFood5();
//             moveSnake5();
//             drawSnake5();
//             drawObstacles5();
//             moveObstacles();
//             checkGameOver5();
//             nextTick5();
//         }, 280)
//     } else if (score > 10 && score <= 15) {
//         setTimeout(() => {
//             clearGameBoard()
//             drawFood5();
//             moveSnake5();
//             drawSnake5();
//             drawObstacles5();
//             moveObstacles();
//             checkGameOver5();
//             nextTick5();
//         }, 200)
//     }else if (score > 15 && score <= 20) {
//         setTimeout(() => {
//             clearGameBoard()
//             drawFood5();
//             moveSnake5();
//             drawSnake5();
//             drawObstacles5();
//             moveObstacles();
//             checkGameOver5();
//             nextTick5();
//         }, 150)
//     }else if (score > 20 && score <= 25) {
//         setTimeout(() => {
//             clearGameBoard()
//             drawFood5();
//             moveSnake5();
//             drawSnake5();
//             drawObstacles5();
//             moveObstacles();
//             checkGameOver5();
//             nextTick5();
//         }, 150)
//     }
//     else if (score > 25 && score <= 30) {
//         setTimeout(() => {
//             clearGameBoard()
//             drawFood5();
//             moveSnake5();
//             drawSnake5();
//             drawObstacles5();
//             moveObstacles();
//             checkGameOver5();
//             nextTick5();
//         }, 100)
//     }
//     else if (score > 30 && score <= 35) {
//         setTimeout(() => {
//             clearGameBoard()
//             drawFood5();
//             moveSnake5();
//             drawSnake5();
//             drawObstacles5();
//             moveObstacles();
//             checkGameOver5();
//             nextTick5();
//         }, 100)
//     }
//     else if (score > 35 && score <= 40) {
//         setTimeout(() => {
//             clearGameBoard()
//             drawFood5();
//             moveSnake5();
//             drawSnake5();
//             drawObstacles5();
//             moveObstacles();
//             checkGameOver5();
//             nextTick5();
//         }, 100)
//     }
//     else if (score > 40 && score <= 45) {
//         setTimeout(() => {
//             clearGameBoard()
//             drawFood5();
//             moveSnake5();
//             drawSnake5();
//             drawObstacles5();
//             moveObstacles();
//             checkGameOver5();
//             nextTick5();
//         }, 100)
//     }
//     else if (score > 45 && score <= 50) {
//         setTimeout(() => {
//             clearGameBoard()
//             drawFood5();
//             moveSnake5();
//             drawSnake5();
//             drawObstacles5();
//             moveObstacles();
//             checkGameOver5();
//             nextTick5();
//         }, 100)
//     }
//     else if (score > 50) {
//         food5 = {};
//         score = 0;
//         document.getElementById("score").innerText = score;
//         completeLevels5();
//
//     }
// }
//
//
// function completeLevels5() {
//     clearGameBoard();
//     var message = "Chúc mừng bạn đã vượt qua vòng 5! Vòng 6 sẽ bắt đầu sau vài giây" ;
//     ctx.font = "30px MV Boli";
//     ctx.fillStyle = "Black";
//     ctx.textAlign = "center";
//
//     // Phân tách thông điệp thành các dòng nếu nó quá dài
//     var maxWidth = gameBoard.width * 0.8; // Giới hạn chiều rộng của văn bản là 80% chiều rộng của bảng
//     var lineHeight = 35; // Độ cao của mỗi dòng
//     var words = message.split(' ');
//     var line = '';
//     var y = gameBoard.height / 2; // Vị trí dọc của văn bản
//
//     for (var i = 0; i < words.length; i++) {
//         var testLine = line + words[i] + ' ';
//         var metrics = ctx.measureText(testLine);
//         var testWidth = metrics.width;
//         if (testWidth > maxWidth && i > 0) {
//             ctx.fillText(line, gameBoard.width / 2, y);
//             line = words[i] + ' ';
//             y += lineHeight;
//         } else {
//             line = testLine;
//         }
//     }
//     ctx.fillText(line, gameBoard.width / 2, y);
//     setTimeout(start6, 5000);
// }
//
//
// // level 6
// function start6() {
//     createFood6();
//     drawFood6();
//     drawSnake6();
//     createMushroom();
//     drawMushroom();
//     xSpeed = unitSize;
//     ySpeed = 0;
//     nextTick6();
// }
//
// var snake6 = [
//     {x:unitSize*4, y:0},
//     {x:unitSize*3, y:0},
//     {x:unitSize*2, y:0},
//     {x:unitSize, y:0},
//     {x:0, y:0},
// ];
//
//
// var mushroom = [10];
// function createMushroom(){
//     for (var i = 0; i <8; i++) {
//         var mushrooms;
//         do{
//             var x = Math.floor(Math.random() * ((gameBoard.width - unitSize) / unitSize)) * unitSize;
//             var y = Math.floor(Math.random() * ((gameBoard.height - unitSize) / unitSize)) * unitSize;
//             mushrooms = { x, y };
//
//         } while (isFoodOnSnake6(mushrooms) || isOnMushroom(mushrooms));
//         mushroom[i] = mushrooms;
//     }
// }
//
//
// function isOnMushroom(ob){
//     for (var i = 0; i < mushroom.length; i++) {
//         if(ob.x === mushroom[i].x && ob.y === mushroom[i].y){
//             return true;
//         }
//     }
//     return false;
// }
//
// function drawMushroom(){
//     for (var i = 0; i < mushroom.length; i++) {
//         var mushroomImage = new Image();
//         mushroomImage.src = 'Nam.png'; // Đường dẫn của hình ảnh quả táo
//
//         // Chờ cho hình ảnh được tải trước khi vẽ
//         if (mushroomImage.complete) {
//             ctx.drawImage(mushroomImage, mushroom[i].x, mushroom[i].y, unitSize, unitSize);
//         } else {
//             // Nếu hình ảnh chưa được tải, bạn có thể thực hiện vẽ khi nó được tải xong
//             mushroomImage.onload = function() {
//                 ctx.drawImage(mushroomImage, mushroom[i].x, mushroom[i].y, unitSize, unitSize);
//             }
//         }
//     }
// }
// var food6;
// function createFood6() {
//     var newFood;
//     do {
//         // Tạo vị trí ngẫu nhiên cho thức ăn
//         var x = Math.floor(Math.random() *((gameBoard.width - unitSize) / unitSize)) * unitSize;
//         var y = Math.floor(Math.random() *((gameBoard.height - unitSize) / unitSize)) * unitSize;
//         food6 = {x, y};
//         newFood = food6;
//     } while (isFoodOnSnake6(newFood) || isOnMushroom(newFood)); // Kiểm tra nếu thức ăn mới trùng với con rắn
//     food6 = newFood;
// }
//
// function isFoodOnSnake6(foodObject) {
//     // Kiểm tra xem thức ăn mới có trùng với bất kỳ phần nào của con rắn không
//     for (var i = 0; i < snake6.length; i++) {
//         if (snake6[i].x === foodObject.x && snake6[i].y === foodObject.y) {
//             return true;
//         }
//     }
//     return false;
// }
//
// function drawFood6() {
//     var img = new Image();
//     img.onload = function() {
//         ctx.drawImage(img, food6.x, food6.y, unitSize, unitSize);
//     };
//     img.src = 'Apple.png'; // Thay link bằng đường dẫn đến hình ảnh của quả táo
// }
//
//
//
//
// function drawSnake6(){
//     ctx.fillStyle='yellow';
//     ctx.strokeStyle ='black';
//     ctx.fillRect(snake6[0].x, snake6[0].y, unitSize,  unitSize);
//     ctx.strokeRect(snake6[0].x, snake6[0].y, unitSize,  unitSize);
//     ctx.fillStyle='green';
//     for (var i = 1; i<snake6.length; i++){
//         ctx.fillRect(snake6[i].x, snake6[i].y, unitSize,  unitSize);
//         ctx.strokeRect(snake6[i].x, snake6[i].y, unitSize,  unitSize);
//     }
//
// }
//
// function moveSnake6() {
//     var head = {
//         x: snake6[0].x + xSpeed,
//         y: snake6[0].y + ySpeed
//     };
//
//     // Kiểm tra xem đầu của con rắn có chạm vào cạnh của vật cản không
//     if (isNearMushroom(head)) {
//         // Nếu đầu của con rắn chạm vào cạnh của vật cản
//         if (ySpeed > 0) { // Nếu đang di chuyển từ trên xuống
//             // Chuyển hướng sang phải
//             xSpeed = unitSize;
//             ySpeed = 0;
//         } else if (ySpeed < 0) { // Nếu đang di chuyển từ dưới lên
//             // Chuyển hướng sang trái
//             xSpeed = -unitSize;
//             ySpeed = 0;
//         } else if (xSpeed < 0) { // Nếu đang di chuyển từ phải qua
//             // Chuyển hướng lên trên
//             xSpeed = 0;
//             ySpeed = -unitSize;
//         } else if (xSpeed > 0) { // Nếu đang di chuyển từ trái qua
//             // Chuyển hướng xuống dưới
//             xSpeed = 0;
//             ySpeed = unitSize;
//         }
//     }
// // Kiểm tra xem đầu của con rắn có chạm vào biên không
//     if (head.x < 0) {
//         head.x = gameBoard.width - unitSize; // Nếu chạm biên bên trái, di chuyển đầu con rắn sang phía bên phải của màn hình
//     } else if (head.x >= gameBoard.width) {
//         head.x = 0; // Nếu chạm biên bên phải, di chuyển đầu con rắn sang phía bên trái của màn hình
//     }
//     if (head.y < 0) {
//         head.y = gameBoard.height - unitSize; // Nếu chạm biên phía trên, di chuyển đầu con rắn xuống dưới màn hình
//     } else if (head.y >= gameBoard.height) {
//         head.y = 0; // Nếu chạm biên phía dưới, di chuyển đầu con rắn lên trên màn hình
//     }
//     snake6.unshift(head); // Di chuyển đầu mới vào con rắn
//     // Kiểm tra xem con rắn có ăn thức ăn không
//     if (snake6[0].x === food6.x && snake6[0].y === food6.y) {
//         score += 2;
//         document.getElementById("score").innerText = score;
//         // Thêm 2 ô vào phần thân của con rắn
//         for (var i = 0; i < 2; i++) {
//             var tail = { x: snake6[snake6.length - 1].x, y: snake6[snake6.length - 1].y };
//             snake6.push(tail);
//         }
//         createFood6();
//     } else {
//         // Loại bỏ phần đuôi của con rắn nếu không ăn thức ăn
//         snake6.pop();
//     }
// }
//
//
// function isNearMushroom(position) {
//     // Kiểm tra xem tọa độ của đầu con rắn có trùng với tọa độ của các vật cản không
//     for (var i = 0; i < mushroom.length; i++) {
//         if (
//             // Kiểm tra xem đầu con rắn có nằm trên, dưới, bên trái hoặc bên phải vật cản không
//             (position.y === mushroom[i].y && (position.x === mushroom[i].x - unitSize || position.x === mushroom[i].x + unitSize)) ||
//             (position.x === mushroom[i].x && (position.y === mushroom[i].y - unitSize || position.y === mushroom[i].y + unitSize))
//         ) {
//             // Kiểm tra hướng di chuyển của con rắn
//             if (ySpeed > 0 && position.x === mushroom[i].x + unitSize) {
//                 return false;
//             }
//             else if (ySpeed > 0 && position.x === mushroom[i].x - unitSize) {
//                 return false;
//             }
//             else if (ySpeed < 0 && position.x === mushroom[i].x + unitSize) {
//                 return false;
//             }
//             else if (ySpeed < 0 && position.x === mushroom[i].x - unitSize) {
//                 return false;
//             }
//
//
//
//
//
//             else  if (xSpeed > 0 && position.y === mushroom[i].y + unitSize) {
//                 return false;
//             }
//             else  if (xSpeed > 0 && position.y === mushroom[i].y - unitSize) {
//                 return false;
//             }
//             else  if (xSpeed < 0 && position.y === mushroom[i].y + unitSize) {
//                 return false;
//             }
//             else  if (xSpeed < 0 && position.y === mushroom[i].y - unitSize) {
//                 return false;
//             }
//
//
//             // Các trường hợp khác, hoặc nếu không đang di chuyển từ trên xuống
//             return true;
//         }
//     }
//     return false;
// }
//
//
//
//
//
//
//
//
//
//
//
//
//
//
// function checkGameOver6() {
//
//     // Kiểm tra va chạm với thân con rắn (trừ đầu)
//     var head = snake6[0];
//     for (var i = 1; i < snake6.length; i++) {
//         if (head.x === snake6[i].x && head.y === snake6[i].y) {
//             running = false; // Game over nếu đầu của con rắn trùng với một phần thân khác
//             displayGameOver();
//             return;
//         }
//     }
//
//     for (var i = 0; i < mushroom.length ; i++) {
//         if(snake6[0].x === mushroom[i].x && snake6[0].y === mushroom[i].y){
//             running = false;
//             displayGameOver();
//             break
//         }
//     }
//
// }
//
//
//
//
// function nextTick6() {
//     if (running) {
//         level6();
//     }
//     else {
//         displayGameOver();
//     }
//
// }
//
// function level6(){
//     if (score <= 5) {
//         setTimeout(() => {
//             clearGameBoard()
//             drawFood6();
//             moveSnake6();
//             drawSnake6();
//             drawMushroom();
//             checkGameOver6();
//             nextTick6();
//         }, 320)
//     }else if (score > 5 && score <= 10) {
//         setTimeout(() => {
//             clearGameBoard()
//             drawFood6();
//             moveSnake6();
//             drawSnake6();
//             drawMushroom();
//             checkGameOver6();
//             nextTick6();
//         }, 280)
//     } else if (score > 10 && score <= 15) {
//         setTimeout(() => {
//             clearGameBoard()
//             drawFood6();
//             moveSnake6();
//             drawSnake6();
//             drawMushroom();
//             checkGameOver6();
//             nextTick6();
//         }, 200)
//     }else if (score > 15 && score <= 20) {
//         setTimeout(() => {
//             clearGameBoard()
//             drawFood6();
//             moveSnake6();
//             drawSnake6();
//             drawMushroom();
//             checkGameOver6();
//             nextTick6();
//         }, 150)
//     }else if (score > 20 && score <= 25) {
//         setTimeout(() => {
//             clearGameBoard()
//             drawFood6();
//             moveSnake6();
//             drawSnake6();
//             drawMushroom();
//             checkGameOver6();
//             nextTick6();
//         }, 150)
//     }
//     else if (score > 25 && score <= 30) {
//         setTimeout(() => {
//             clearGameBoard()
//             drawFood6();
//             moveSnake6();
//             drawSnake6();
//             drawMushroom();
//             checkGameOver6();
//             nextTick6();
//         }, 100)
//     }
//     else if (score > 30 && score <= 35) {
//         setTimeout(() => {
//             clearGameBoard()
//             drawFood6();
//             moveSnake6();
//             drawSnake6();
//             drawMushroom();
//             checkGameOver6();
//             nextTick6();
//         }, 100)
//     }
//     else if (score > 35 && score <= 40) {
//         setTimeout(() => {
//             clearGameBoard()
//             drawFood6();
//             moveSnake6();
//             drawSnake6();
//             drawMushroom();
//             checkGameOver6();
//             nextTick6();
//         }, 100)
//     }
//     else if (score > 40 && score <= 45) {
//         setTimeout(() => {
//             clearGameBoard()
//             drawFood6();
//             moveSnake6();
//             drawSnake6();
//             drawMushroom();
//             checkGameOver6();
//             nextTick6();
//         }, 100)
//     }
//     else if (score > 45 && score <= 50) {
//         setTimeout(() => {
//             clearGameBoard()
//             drawFood6();
//             moveSnake6();
//             drawSnake6();
//             drawMushroom();
//             checkGameOver6();
//             nextTick6();
//         }, 100)
//     }
//     else if (score > 50) {
//         completeLevels6();
//
//     }
// }
//
//
// function completeLevels6() {
//     clearGameBoard();
//     var message = "Chúc mừng bạn đã vượt qua vòng 6!" ;
//     ctx.font = "30px MV Boli";
//     ctx.fillStyle = "Black";
//     ctx.textAlign = "center";
//
//     // Phân tách thông điệp thành các dòng nếu nó quá dài
//     var maxWidth = gameBoard.width * 0.8; // Giới hạn chiều rộng của văn bản là 80% chiều rộng của bảng
//     var lineHeight = 35; // Độ cao của mỗi dòng
//     var words = message.split(' ');
//     var line = '';
//     var y = gameBoard.height / 2; // Vị trí dọc của văn bản
//
//     for (var i = 0; i < words.length; i++) {
//         var testLine = line + words[i] + ' ';
//         var metrics = ctx.measureText(testLine);
//         var testWidth = metrics.width;
//         if (testWidth > maxWidth && i > 0) {
//             ctx.fillText(line, gameBoard.width / 2, y);
//             line = words[i] + ' ';
//             y += lineHeight;
//         } else {
//             line = testLine;
//         }
//     }
//     ctx.fillText(line, gameBoard.width / 2, y);
//
// }
