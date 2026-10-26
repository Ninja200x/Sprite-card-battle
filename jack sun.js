// ==========================================
// PLAYER
// ==========================================

let player = {
    hp: 100,
    maxHP: 100,

    energy: 3,
    maxEnergy: 3,

    block: 0,

    gold: 0
};


// ==========================================
// ENEMY
// ==========================================

let enemy = {
    name: "Crazy Goblin",
    hp: 100,
    maxHP: 100,
    damage: 12
};


// ==========================================
// GAME VARIABLES
// ==========================================

let playerTurn = true;
let battleNumber = 1;

let shopEvery = 3;
let inShop = false;


// ==========================================
// CARDS
// ==========================================

const cards = [

    {
        name: "Sword Slash",
        cost: 1,
        damage: 15,
        description: "Deal 15 damage.",

        action: function () {
            dealDamage(15);
           
        }
    },

    {
        name: "Heavy Strike",
        cost: 2,
        damage: 40,
        description: "Deal 40 damage.",

        action: function () {
            dealDamage(40);
            
        }
    },

    {
        name: "Fireball",
        cost: 1,
        damage: 20,
        description: "Launch a fireball.",

        action: function () {
            dealDamage(20);
            
        }
    },

    {
        name: "Shield",
        cost: 1,
        damage: 0,
        description: "Gain 25 Block.",

        action: function () {
            player.block += 25;

            showMessage("You gained 25 Block!");

            updateDisplay();
        }
    },

    {
        name: "Healing Potion",
        cost: 2,
        damage: 0,
        description: "Heal 25 HP.",

        action: function () {

            player.hp += 25;

            if (player.hp > player.maxHP) {
                player.hp = player.maxHP;
            }

            showMessage("You healed 25 HP!");

            updateDisplay();
        }
    }

];

// ==========================================
// SHOP-ONLY ABILITIES
// ==========================================

const shopAbilities = [

    {
        name: "🔥 Burning Strike",
        cost: 2,
        damage: 25,
        description: "Deal 25 damage and burn the enemy.",
        price: 30,

        action: function () {
            dealDamage(25);
            showMessage("🔥 Burning Strike!");
        }
    },

    {
        name: "💥 Double Slash",
        cost: 2,
        damage: 30,
        description: "Attack the enemy twice for 15 damage.",
        price: 40,

        action: function () {
            dealDamage(15);

            setTimeout(function () {
                if (enemy.hp > 0) {
                    dealDamage(15);
                }
            }, 300);

            showMessage("💥 Double Slash!");
            cards.push(...shopAbilities);
        }
    },

    {
        name: "⚡ Energy Surge",
        cost: 0,
        description: "Gain 2 Energy immediately.",
        price: 35,

        action: function () {
            player.energy += 2;

            if (player.energy > player.maxEnergy) {
                player.energy = player.maxEnergy;
            }

            showMessage("⚡ You gained 2 Energy!");

            updateDisplay();
        }
    },

    {
        name: "🛡️ Fortify",
        cost: 2,
        description: "Gain 50 Block.",
        price: 35,

        action: function () {
            player.block += 50;

            showMessage("🛡️ You gained 50 Block!");

            updateDisplay();
        }
    }

];
let currentShopAbilities = [];
let shopRerollCost = 10;
// ==========================================
// DRAW CARDS
// ==========================================

function drawCards() {

    const cardContainer = document.getElementById("cards");

    cardContainer.innerHTML = "";

    for (let i = 0; i < 5; i++) {

        let randomCard =
            cards[Math.floor(Math.random() * cards.length)];

        let cardElement =
            document.createElement("div");

        cardElement.className = "card";

        cardElement.innerHTML = `

            <h3>${randomCard.name}</h3>

            <div class="cost">
                ⚡ ${randomCard.cost}
            </div>

            ${
                randomCard.damage > 0
                ?
                `<div class="damage">
                    ⚔️ ${randomCard.damage}
                </div>`
                :
                ""
            }

            <div class="description">
                ${randomCard.description}
            </div>

        `;

        cardElement.onclick = function () {
            playCard(randomCard);
        };

        cardContainer.appendChild(cardElement);
    }
}

function rerollShop() {

    if (player.gold < shopRerollCost) {
        showMessage("❌ Not enough gold!");
        return;
    }

    player.gold -= shopRerollCost;

    generateShop();

    updateShopGold();
    updateDisplay();

    showMessage("🔄 Shop rerolled!");
}

function generateShop() {

    const shopItems = document.getElementById("shopItems");

    // Remove only the ability cards currently displayed
    const oldAbilities = shopItems.querySelectorAll(".shop-ability");

    oldAbilities.forEach(function (item) {
        item.remove();
    });

    // Don't show abilities the player already bought
    let availableAbilities = shopAbilities.filter(function (ability) {
        return !cards.includes(ability);
    });

    // Randomize
    availableAbilities.sort(function () {
        return Math.random() - 0.5;
    });

    // Only show 3
    let shopChoices = availableAbilities.slice(0, 3);

    // Create the 3 shop abilities
    
}
function createShopAbility(ability) {

    const shopItems =
        document.getElementById("shopItems");

    const item =
        document.createElement("div");

    item.className = "shop-item shop-ability";

    item.innerHTML = `

        <h3>${ability.name}</h3>

        <p>${ability.description}</p>

        <p>⚡ Cost: ${ability.cost}</p>

        <p>💰 ${ability.price} Gold</p>

    `;

    item.onclick = function () {

        if (player.gold < ability.price) {

            showMessage("❌ Not enough gold!");

            return;
        }

        player.gold -= ability.price;

        // Add purchased ability to skill RNG
        cards.push(ability);

        showMessage(
            `${ability.name} added to your skills!`
        );

        item.remove();

        updateShopGold();
        updateDisplay();
    };

    shopItems.appendChild(item);
}

// ==========================================
// PLAY CARD
// ==========================================

function playCard(card) {

    if (inShop) {
        return;
    }

    if (!playerTurn) {

        showMessage("Wait for your turn!");

        return;
    }

    if (player.energy < card.cost) {

        showMessage("Not enough energy!");

        return;
    }

    player.energy -= card.cost;

    card.action();

    updateDisplay();
}


// ==========================================
// DAMAGE ENEMY
// ==========================================

function dealDamage(amount) {

    if (enemy.hp <= 0) {
        return;
    }

    enemy.hp -= amount;

    if (enemy.hp < 0) {
        enemy.hp = 0;
    }

    showMessage(`You dealt ${amount} damage!`);

    enemyHitAnimation();

    updateDisplay();

    if (enemy.hp <= 0) {

        playerTurn = false;

        disableCards();

        setTimeout(function () {
            enemyDefeated();
        }, 600);
    }
}


// ==========================================
// ENEMY TURN
// ==========================================

function enemyTurn() {

    if (enemy.hp <= 0) {
        return;
    }

    playerTurn = false;

    disableCards();

    showMessage(`${enemy.name} is attacking!`);

    enemyAttackAnimation();

    setTimeout(function () {

        let damage = enemy.damage;

        if (player.block > 0) {

            let blocked =
                Math.min(player.block, damage);

            player.block -= blocked;

            damage -= blocked;

            showMessage(
                `Your Block absorbed ${blocked} damage!`
            );
        }

        if (damage > 0) {

            player.hp -= damage;

            playerHitAnimation();

            if (player.hp < 0) {
                player.hp = 0;
            }
        }

        updateDisplay();

        if (player.hp <= 0) {

            gameOver();

            return;
        }

        setTimeout(function () {

            startPlayerTurn();

        }, 700);

    }, 500);
}


// ==========================================
// END TURN
// ==========================================

function endTurn() {

    if (!playerTurn || inShop) {
        return;
    }

    

    updateDisplay();

    enemyTurn();
}


// ==========================================
// START PLAYER TURN
// ==========================================

function startPlayerTurn() {

    if (inShop) {
        return;
    }

    playerTurn = true;

    player.energy = player.maxEnergy;

    drawCards();

    enableCards();

    showMessage("Your turn!");

    updateDisplay();
}


// ==========================================
// DISABLE CARDS
// ==========================================

function disableCards() {

    const cardElements =
        document.querySelectorAll("#cards .card");

    cardElements.forEach(function (card) {

        card.style.pointerEvents = "none";

        card.style.opacity = "0.5";

    });
}


// ==========================================
// ENABLE CARDS
// ==========================================

function enableCards() {

    const cardElements =
        document.querySelectorAll("#cards .card");

    cardElements.forEach(function (card) {

        card.style.pointerEvents = "auto";

        card.style.opacity = "1";

    });
}


// ==========================================
// ENEMY DEFEATED
// ==========================================

function enemyDefeated() {

    let reward = 10 + battleNumber * 2;

    player.gold += reward;

    showMessage(
        `${enemy.name} defeated! +${reward} Gold`
    );

    updateDisplay();

    // Every 3 battles
    if (battleNumber % shopEvery === 0) {

        setTimeout(function () {

            openShop();

        }, 1000);

    } else {

        setTimeout(function () {

            nextBattle();

        }, 1000);
    }
}


// ==========================================
// NEXT BATTLE
// ==========================================

function nextBattle() {

    battleNumber++;

    createNextEnemy();
}


// ==========================================
// CREATE NEXT ENEMY
// ==========================================
// ==========================================
// CREATE NEXT ENEMY
// ==========================================


function createNextEnemy() {
    const enemies = [
        { name: "Crazy Goblin", gif: "image/goblin.gif" },
        { name: "Dark Knight", gif: "image/knight.gif" },
        { name: "Fire Demon", gif: "image/fire-demon.gif" },
        { name: "Stone Golem", gif: "image/stone-golem.gif" },
        { name: "Shadow Beast", gif: "image/shadow-beast.gif" },
        { name: "Dragon", gif: "image/dragon.gif" }
    ];

    // Keep using the Dragon after the sixth battle
    const index = Math.min(battleNumber - 1, enemies.length - 1);
    const currentEnemy = enemies[index];

    enemy.name = currentEnemy.name;

    // Gradual difficulty scaling
    enemy.maxHP = 100 + (battleNumber - 1) * 20;
    enemy.damage = 10 + Math.floor((battleNumber - 1) * 1.5);

    // Bosses get extra HP
    if (battleNumber % 5 === 0) {
        enemy.maxHP = Math.floor(enemy.maxHP * 1.3);
    }

    enemy.hp = enemy.maxHP;

    // Update enemy sprite
    document.getElementById("enemySprite").src = currentEnemy.gif;

    // Reset battle resources
    player.block = 0;
    player.energy = player.maxEnergy;

    updateDisplay();
    showMessage(`Battle ${battleNumber}: ${enemy.name} appears!`);

    setTimeout(function () {
        startPlayerTurn();
    }, 800);
}

// ==========================================
// SHOP
// ==========================================

function openShop() {

    inShop = true;

    playerTurn = false;

    disableCards();

    const cardsContainer =
        document.getElementById("cards");

    const shopScreen =
        document.getElementById("shopScreen");

    // Hide battle cards
    cardsContainer.style.display = "none";

    // Show shop
    shopScreen.style.display = "block";

    // Show gold
    document.getElementById("shopGold").textContent =
        player.gold;

    const shopItems =
        document.getElementById("shopItems");

    shopItems.innerHTML = "";

    // Full Heal
    createShopItem(
        "❤️ Full Heal",
        "Restore all HP",
        20,
        function () {

            player.hp = player.maxHP;

            player.gold -= 20;

            showMessage("You restored all HP!");

            updateDisplay();

            updateShopGold();
        }
    );


    // Max HP
    createShopItem(
        "❤️ Max HP +20",
        "Increase maximum HP by 20",
        30,
    function () {

            player.maxHP += 20;

            player.hp += 20;

            player.gold -= 30;

            showMessage(
                "Maximum HP increased by 20!"
            );

            updateDisplay();

            updateShopGold();
        }
    );


    // Max Energy
    createShopItem(
        "⚡ Max Energy +1",
        "Increase maximum energy by 1",
        40,
        function () {

            player.maxEnergy += 1;

            player.energy =
                player.maxEnergy;

            player.gold -= 40;

            showMessage(
                "Maximum Energy increased!"
            );

            updateDisplay();

            updateShopGold();
        }
    
    );
    generateShop();
       
       
    
}


// ==========================================
// CREATE SHOP ITEM
// ==========================================

function createShopItem(
    name,
    description,
    price,
    action
) {

    const shopItems =
        document.getElementById("shopItems");

    const item =
        document.createElement("div");

    item.className = "shop-item";

    item.innerHTML = `

        <h3>${name}</h3>

        <p>${description}</p>

        <p>💰 ${price} Gold</p>

    `;

    item.onclick = function () {

        if (player.gold < price) {

            showMessage(
                "Not enough gold!"
            );

            return;
        }

        action();
    };

    shopItems.appendChild(item);
}


// ==========================================
// UPDATE SHOP GOLD
// ==========================================

function updateShopGold() {

    document.getElementById("shopGold").textContent =
        player.gold;
}


// ==========================================
// CLOSE SHOP
// ==========================================

function closeShop() {

    inShop = false;

    const shopScreen =
        document.getElementById("shopScreen");

    const cardsContainer =
        document.getElementById("cards");

    shopScreen.style.display = "none";

    cardsContainer.style.display = "flex";

    showMessage(
        `Battle ${battleNumber + 1} is starting!`
    );

    setTimeout(function () {

        nextBattle();

    }, 500);
}


// ==========================================
// LEAVE SHOP
// ==========================================

document.getElementById(
    "leaveShopButton"
).onclick = function () {

    closeShop();

};


// ==========================================
// GAME OVER
// ==========================================

function gameOver() {

    playerTurn = false;

    disableCards();

    showMessage("💀 GAME OVER!");

    document.getElementById(
        "endTurnButton"
    ).disabled = true;
}


// ==========================================
// UPDATE DISPLAY
// ==========================================

function updateDisplay() {

    document.getElementById("hpText").textContent =
        player.hp;

    document.getElementById("energyText").textContent =
        player.energy;

    document.getElementById("blockText").textContent =
        player.block;

    document.getElementById("goldText").textContent =
        player.gold;


    // Player HP

    let playerPercent =
        (player.hp / player.maxHP) * 100;

    document.getElementById(
        "playerHealth"
    ).style.width =
        playerPercent + "%";

    document.getElementById(
        "playerHP"
    ).textContent =
        `${player.hp} / ${player.maxHP}`;


    // Enemy HP

    let enemyPercent =
        (enemy.hp / enemy.maxHP) * 100;

    document.getElementById(
        "enemyHealth"
    ).style.width =
        enemyPercent + "%";

    document.getElementById(
        "enemyHP"
    ).textContent =
        `${enemy.hp} / ${enemy.maxHP}`;

    document.getElementById(
        "enemyName"
    ).textContent =
        enemy.name;
}


// ==========================================
// MESSAGE
// ==========================================

function showMessage(message) {

    document.getElementById(
        "battleMessage"
    ).textContent =
        message;
}


// ==========================================
// PLAYER ATTACK ANIMATION
// ==========================================

function playerAttackAnimation() {

    const sprite =
        document.getElementById("playerSprite");

    sprite.classList.remove(
        "player-attack"
    );

    void sprite.offsetWidth;

    sprite.classList.add(
        "player-attack"
    );
}


// ==========================================
// ENEMY ATTACK ANIMATION
// ==========================================

function enemyAttackAnimation() {

    const sprite =
        document.getElementById("enemySprite");

    sprite.classList.remove(
        "enemy-attack"
    );

    void sprite.offsetWidth;

    sprite.classList.add(
        "enemy-attack"
    );
}


// ==========================================
// PLAYER HIT
// ==========================================

function playerHitAnimation() {

    const sprite =
        document.getElementById("playerSprite");

    sprite.classList.remove("hit");

    void sprite.offsetWidth;

    sprite.classList.add("hit");
}


// ==========================================
// ENEMY HIT
// ==========================================

function enemyHitAnimation() {

    const sprite =
        document.getElementById("enemySprite");

    sprite.classList.remove("hit");

    void sprite.offsetWidth;

    sprite.classList.add("hit");
}


// ==========================================
// START GAME
// ==========================================

function startGame() {

    player.hp = 100;

    player.maxHP = 100;

    player.energy = 3;

    player.maxEnergy = 3;

    player.block = 0;

    player.gold = 0;

    battleNumber = 1;

    inShop = false;

    playerTurn = true;

    enemy.name = "Crazy Goblin";

    enemy.maxHP = 100;

    enemy.hp = 100;

    enemy.damage = 12;

    // Make sure shop is hidden
    document.getElementById(
        "shopScreen"
    ).style.display = "none";

    document.getElementById(
        "cards"
    ).style.display = "flex";

    updateDisplay();

    drawCards();

    showMessage("Battle 1: Crazy Goblin appears!");

}


// ==========================================
// START GAME
// ==========================================

startGame();