$(document).ready(function () {
	loadItems();
});

// retrieves and displays all item data from the server via AJAX GET request
function loadItems() {
	// references the grid container element in jQuery 
	var contentRows = $('#contentRows');
	
	$.ajax({
		type: 'GET',
		url: 'http://vending.us-east-1.elasticbeanstalk.com/items',
		success: function(itemArray) {
			// the jQuery .each function runs a for each loop through the items dataset
			$.each(itemArray, function(index, item){
				var itemId = item.id;
				var name = item.name;
				var price = item.price;
				var quantity = item.quantity;
				
				// clears the existing rows before loadItemRow adds new items
				clearItems(itemId);
				
				// append each row to the grid
				contentRows.append(loadItemRow(itemId, name, price, quantity));
			})
			
		},
		 
		error: function() {
			$('#errorMessages') // references the #errorMessages unordered list
				.append($('<li>') // appends a list item to the class
				.attr({class: 'list-group-item list-group-item-danger'}) // assigns two class attributes to the list element
				.text('Error calling web service. Please try again later.')); // text the user will see if Ajax call fails
		}
	});
}

// if the itemId already exists, remove it
function clearItems(itemId) {
    $('#button' + itemId).remove();
}

// builds each row of the grid dynamically, sends the row back up to loadItems to be appended
function loadItemRow(itemId, name, price, quantity) {
    var row =   '<div class="grid-item" role="button" onclick="selectItem(' + itemId + ')" id="button' + itemId + '">'
    row +=          '<div class="col-12">';
    row +=              '<div class="flex-container">';
    row +=                  '<div class="row buttonId">';
	row +=						'Id: ';
    row +=                      itemId;
    row +=                  '</div>';
    row +=                  '<br>';
    row +=                  '<div class="row buttonName">';
    row +=                      name;
    row +=                  '</div>';
    row +=                  '<div class="row buttonPrice">';
    row +=                      '$ ';
    row +=                      price;
    row +=                  '</div>';
    row +=                  '<input type="hidden" id="buttonPrice' + itemId + '" value="' + price + '" required>';
    row +=                  '<div class="row buttonQuantity">';
    row +=                      '<br>';
    row +=                      '<br>';
    row +=                      'Quanity Left: '; 
    row +=                      quantity;
    row +=                  '</div>';
    row +=              '</div>';
    row +=          '</div>';
    row +=       '</div>';

    return row;
}

// AJAX POST request automatically calcuates # of quarters, dimes, nickels, pennies leftover from transaction
// updates quantity and displays new total after transaction by calling other functions
function makePurchase() {
	$('errorMessages').empty();
	// creates total variable by identifying how much money is in the #totalMoney element
	var total = $('#totalMoney').val() * 1;
	var id = $('#displayItemId').val();
	
	$.ajax({
		type: 'POST',
		url: 'http://vending.us-east-1.elasticbeanstalk.com/money/' + total + '/item/' + id,
		success: function (response) {
			$('#displayMessages').val('Thank You!!!');
			displayChangeAfterPurchase(response); 
			loadItems();
			newTotal(id);
		},
		// gives a JSON default error message depending on the situation
		error: function (response) {
			$('#displayMessages').val(response.responseJSON.message); 
		}
	})
}


// the Money section

// calculates new total after transaction
function newTotal(id) {
	// creates variable for money in Total $ In textbox
	var total = $('#totalMoney').val() * 1;
	// creates variable for the price of the item selected
	var price = $('#buttonPrice' + id).val() * 1;
	total -= price;
	$('#totalMoney').val(total.toFixed(2));
}

function addDollar() {
	var total = $('#totalMoney').val() * 1;
    total += 1.00;
    $('#totalMoney').val(total.toFixed(2));
	
	// send to new function to get the quarters, dimes, nickels, pennies
    displayTotalChange(total);
}

function addQuarter() {
	var total = $('#totalMoney').val() * 1;
    total += 0.25;
    $('#totalMoney').val(total.toFixed(2));
	
    displayTotalChange(total);
}

function addDime() {
	var total = $('#totalMoney').val() * 1;
    total += 0.10;
    $('#totalMoney').val(total.toFixed(2));
	
    displayTotalChange(total);
}

function addNickel() {
	var total = $('#totalMoney').val() * 1;
    total += 0.05;
    $('#totalMoney').val(total.toFixed(2));
	
    displayTotalChange(total);
}

// displays item id in the Item textbox
function selectItem(id) {
	$('#errorMessages').empty();
	$('#displayItemId').val(id);
}

// finds the amount of quarters, nickels, dimes, and pennies from Add $ buttons (user)
// Math.floor rounds down to first whole number
// Math.ceil rounds up to next whole number
function displayTotalChange(total) {
	var remainder = 0.00;
	
	// find # of quarters in the total by dividing it by 0.25
	var quarters = Math.floor(total / 0.25);
	// find remainder by subtracting # of quarters from the total
	var remainder = total - (quarters * 0.25);
	var remainder = (Math.ceil(remainder * 100) / 100).toFixed(2) // ensures whole number
	
	var dimes = Math.floor(remainder / 0.10);
	var remainder = remainder - (dimes * 0.10);
	var remainder = (Math.ceil(remainder * 100) / 100).toFixed(2)
	
	var nickels = Math.floor(remainder / 0.05);
	var remainder = remainder - (nickels * 0.05);
	var remainder = (Math.ceil(remainder * 100) / 100).toFixed(2)
	
	var pennies = 0;
	
	displayChangeOutput(quarters, dimes, nickels, pennies);
}

// receives array for # of quarters, dimes, nickels, pennies leftover from
// makePurchase POST request and separates them into variables (server)
function displayChangeAfterPurchase(response) {
    var quarters = response.quarters;
    var dimes = response.dimes;
    var nickels = response.nickels;
    var pennies = response.pennies;

    displayChangeOutput(quarters, dimes, nickels, pennies);
}

// displays the number of quarters, dimes, nickels, and pennies leftover with proper grammar
function displayChangeOutput(quarters, dimes, nickels, pennies) {
	var changeToReturn = '';
	
	// if quarters equals 1, return one quarter singular
	if (quarters == 1) {
		changeToReturn += quarters + 'Quarter'
	}
	
	// if quarters is greater than 1, return multiple quarters plural
	else if (quarters > 1) {
		// set variable to # Quarters
		changeToReturn += quarters + ' Quarters'
	}
	
	// add # of dimes onto the number of quarters, save changeToReturn
	if (dimes == 1) {
		changeToReturn += ' ';
		changeToReturn += dimes + ' Dime'
	}
	
	else if (dimes > 1) {
		changeToReturn += ' ';
		changeToReturn += dimes + ' Dimes'
	}
	
	// add # of nickels onto the number of quarters and dimes, save changeToReturn
	if (nickels == 1) {
		changeToReturn += ' ';
		changeToReturn += nickels + ' Nickel'
	}
	
	else if (nickels > 1) {
		changeToReturn += ' ';
		changeToReturn += nickels + ' Nickels'
	}
	
	// add # of pennies onto the number of quarters, dimes, nickels, save changeToReturn
	if (pennies == 1) {
		changeToReturn += ' ';
		changeToReturn += pennies + ' Penny'
	}
	
	else if (pennies > 1) {
		changeToReturn += ' ';
		changeToReturn += pennies + ' Pennies'
	}
	
	// display the total change in quarters, dimes, nickels, pennies in the Change textbox
	$('#displayChange').val(changeToReturn);
}

// resets all textboxes onclick
function changeReturn() {
	$('#totalMoney').val('0.00');
	$('#displayMessages').val('');
    $('#displayItemId').val('');
    $('#displayChange').val('');
}


	




