// eslint-disable-next-line no-var
var OregonH = OregonH || {};

class UI {
  // show a notification in the message area
  notify(message, type) {
    document.getElementById('updates-area').innerHTML = `<div class="update-${type}">Hour ${Math.ceil(this.redwagon.hour)}: ${message}</div> ${document.getElementById('updates-area').innerHTML}`;
  }

  // refresh visual redwagon stats
  refreshStats() {
    // Destructure some objects for easy access
    const {
      hour, distance, friends, supplies, food, money, energy, weight, capacity,
    } = this.redwagon;
    const { ceil, floor } = Math;

    // modify the dom
    document.getElementById('stat-hour').innerHTML = `${ceil(hour)}`; // Math.ceil(this.redwagon.hour);
    document.getElementById('stat-distance').innerHTML = `${floor(distance)}`;
    document.getElementById('stat-friends').innerHTML = `${friends}`;
    document.getElementById('stat-supplies').innerHTML = `${supplies}`;
    document.getElementById('stat-food').innerHTML = `${ceil(food)}`;
    document.getElementById('stat-money').innerHTML = `${money}`;
    document.getElementById('stat-energy').innerHTML = `${energy}`;
    document.getElementById('stat-weight').innerHTML = `${ceil(weight)}/${capacity}`;

    // update redwagon position
    document.getElementById('redwagon').style.left = `${(380 * distance / OregonH.FINAL_DISTANCE)}px`;
  }

  // show attack
  showAttack(energy, gold) {
    const attackDiv = document.getElementById('attack');
    attackDiv.classList.remove('hidden');

    // keep properties
    this.energy = energy;
    this.gold = gold;

    // show energy
    document.getElementById('attack-description').innerHTML = `Energy: ${energy}`;

    // init once
    if (!this.attackInitiated) {
      // Stand up to villains
      document.getElementById('confront').addEventListener('click', this.confront.bind(this));

      // run away
      document.getElementById('runaway').addEventListener('click', this.runaway.bind(this));

      this.attackInitiated = true;
    }
  }

  // Stand up to villains
  confront() {
    const { energy, gold } = this;

    if (energy > OregonH.redwagon.energy) {
      OregonH.UI.notify('Not enough energy to confront', 'negative');
      return false;
    }

    // damage can be 0 to 2 * energy
    const damage = Math.ceil(Math.max(0, energy * 2 * Math.random() - this.redwagon.energy));

    // check if Dora still has crew
    if (damage < this.redwagon.friends) {
      this.redwagon.friends -= damage;
      this.redwagon.money += gold;
      this.notify(`${damage} friends ran away from him`, 'negative');
      this.notify(`Found $ ${gold}`, 'gold', 'positive');
    } else {
      this.redwagon.friends = 0;
      this.notify('Everybody left in the confrontation', 'negative');
    }

    // resume journey
    document.getElementById('attack').classList.add('hidden');
    this.game.resumeJourney();
  }

  // runing away from enemy
  runaway() {
    const { energy } = this;

    // damage can be 0 to energy / 2
    const damage = Math.ceil(Math.max(0, energy * Math.random() / 2));

    // check if Dora still has crew
    if (damage < this.redwagon.friends) {
      this.redwagon.friends -= damage;
      this.notify(`${damage} friends ran away`, 'negative');
    } else {
      this.redwagon.friends = 0;
      this.notify('Everybody decided not to finish the journey', 'negative');
    }

    // remove event listener
    // document.getElementById('runaway').removeEventListener('click', this.runaway);

    // resume journey
    document.getElementById('attack').classList.add('hidden');
    this.game.resumeJourney();
  }

  // show shop
  showShop(products) {
    // get shop area
    const shopDiv = document.getElementById('shop');
    shopDiv.classList.remove('hidden');

    // init the shop just once
    if (!this.shopInitiated) {
      // event delegation
      shopDiv.addEventListener('click', (e) => {
        // what was clicked
        const target = e.target || e.src;

        // exit button
        if (target.tagName === 'BUTTON') {
          // resume journey
          shopDiv.classList.add('hidden');
          OregonH.UI.game.resumeJourney();
        } else if (target.tagName === 'DIV' && target.className.match(/product/)) {
          OregonH.UI.buyProduct({
            item: target.getAttribute('data-item'),
            qty: target.getAttribute('data-qty'),
            price: target.getAttribute('data-price'),
          });
        }
      });
      this.shopInitiated = true;
    }

    // clear existing content
    const prodsDiv = document.getElementById('prods');
    prodsDiv.innerHTML = '';

    // show products
    let product;
    for (let i = 0; i < products.length; i += 1) {
      product = products[i];
      prodsDiv.innerHTML += `<div class="product" data-qty="${product.qty}" data-item="${product.item}" data-price="${product.price}">${product.qty} ${product.item} - $${product.price}</div>`;
    }
  }

  // buy product
  buyProduct(product) {
    // check we can afford it
    if (product.price > OregonH.UI.redwagon.money) {
      OregonH.UI.notify('Not enough coins', 'negative');
      return false;
    }

    OregonH.UI.redwagon.money -= product.price;

    OregonH.UI.redwagon[product.item] += +product.qty;

    OregonH.UI.notify(`Picked up ${product.qty} ${product.item}`, 'positive');

    // update weight
    OregonH.UI.redwagon.updateWeight();

    // update visuals
    OregonH.UI.refreshStats();
    return true;
  }
}

OregonH.UI = new UI();
