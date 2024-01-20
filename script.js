'use strict';

/////////////////////////////////////////////////
/////////////////////////////////////////////////
// BANKIST APP

/////////////////////////////////////////////////
// Data

// DIFFERENT DATA! Contains movement dates, currency and locale

const account1 = {
  owner: 'Jonas Schmedtmann',
  movements: [200, 455.23, -306.5, 25000, -642.21, -133.9, 79.97, 1300],
  interestRate: 1.2, // %
  pin: 1111,

  movementsDates: [
    '2019-11-18T21:31:17.178Z',
    '2019-12-23T07:42:02.383Z',
    '2020-01-28T09:15:04.904Z',
    '2020-04-01T10:17:24.185Z',
    '2020-05-08T14:11:59.604Z',
    '2023-02-24T17:01:17.194Z',
    '2023-02-27T23:36:17.929Z',
    '2023-02-28T10:51:36.790Z',
  ],
  currency: 'EUR',
  locale: 'pt-PT', // de-DE
};

const account2 = {
  owner: 'Jessica Davis',
  movements: [5000, 3400, -150, -790, -3210, -1000, 8500, -30],
  interestRate: 1.5,
  pin: 2222,

  movementsDates: [
    '2019-11-01T13:15:33.035Z',
    '2019-11-30T09:48:16.867Z',
    '2019-12-25T06:04:23.907Z',
    '2020-01-25T14:18:46.235Z',
    '2020-02-05T16:33:06.386Z',
    '2020-04-10T14:43:26.374Z',
    '2020-06-25T18:49:59.371Z',
    '2020-07-26T12:01:20.894Z',
  ],
  currency: 'USD',
  locale: 'en-US',
};

const accounts = [account1, account2];

/////////////////////////////////////////////////
// Elements
const labelWelcome = document.querySelector('.welcome');
const labelDate = document.querySelector('.date');
const labelBalance = document.querySelector('.balance__value');
const labelSumIn = document.querySelector('.summary__value--in');
const labelSumOut = document.querySelector('.summary__value--out');
const labelSumInterest = document.querySelector('.summary__value--interest');
const labelTimer = document.querySelector('.timer');

const containerApp = document.querySelector('.app');
const containerMovements = document.querySelector('.movements');

const btnLogin = document.querySelector('.login__btn');
const btnTransfer = document.querySelector('.form__btn--transfer');
const btnLoan = document.querySelector('.form__btn--loan');
const btnClose = document.querySelector('.form__btn--close');
const btnSort = document.querySelector('.btn--sort');

const inputLoginUsername = document.querySelector('.login__input--user');
const inputLoginPin = document.querySelector('.login__input--pin');
const inputTransferTo = document.querySelector('.form__input--to');
const inputTransferAmount = document.querySelector('.form__input--amount');
const inputLoanAmount = document.querySelector('.form__input--loan-amount');
const inputCloseUsername = document.querySelector('.form__input--user');
const inputClosePin = document.querySelector('.form__input--pin');

/////////////////////////////////////////////////
// Functions

function formattedDate(date) {

    const daysPassed = Math.round(Math.abs((date - (new Date())) / (1000 * 60 * 60 * 24)));

    if (daysPassed === 0) return 'Today';
    if (daysPassed === 1) return 'Yesterday';
    if (daysPassed <= 7) return `${daysPassed} Days Ago`;

    return `${`${date.getMonth()+1}`.padStart(2, 0)}/${`${date.getDate()}`.padStart(2, 0)}/${date.getFullYear()}`;

}

function displayMovements(account, sort = false){

    containerMovements.innerHTML = '';

    const transactions = sort ? account.movements.slice().sort((a, b) => a - b) : account.movements;

    transactions.forEach(function(movement, index) {

        const type = movement > 0 ? 'deposit' : 'withdrawal';

        const displayDate = formattedDate(new Date(account.movementsDates[index]));

        const movRowDivTag = `
            <div class="movements__row">
                <div class="movements__type movements__type--${type}">${index + 1} ${type}</div>
                <div class="movements__date">${displayDate}</div>
                <div class="movements__value">$${movement.toFixed(2)}</div>
            </div>
        `;

        containerMovements.insertAdjacentHTML('afterbegin', movRowDivTag);
    })

}

function calculateBalance(account){
    account.balance = account.movements.reduce(function(accumulator, transaction) {
        return accumulator + transaction;
    });
    labelBalance.textContent = `$${account.balance.toFixed(2)}`;
}

function calculateSummary(account){
    const deposits = account.movements
        .filter(function(transaction) { return transaction > 0; })
        .reduce(function(total, transaction) { return total + transaction; });

    labelSumIn.textContent = `$${deposits.toFixed(2)}`;

    const withdrawals = account.movements
        .filter(function(transaction, _, arr) { return transaction < 0; })
        .reduce(function(total, transaction, _, arr) { return total +transaction; });

    labelSumOut.textContent = `$${Math.abs(withdrawals.toFixed(2))}`;

    const interest = account.movements
        .filter(function(transaction) { return transaction > 0; })
        .map(function(deposit) { return deposit * account.interestRate / 100; })
        .filter(function(deposit) { return deposit >= 1; })
        .reduce(function(total, deposit) { return total + deposit; });

    labelSumInterest.textContent = `$${interest.toFixed(2)}`;
}

function createUsernames(users){
    users.forEach(function(account) {
        account.username = account.owner.toLowerCase().split(' ').map(name => name[0]).join('');
    });
}
createUsernames(accounts);

function updateUI(account) {
    displayMovements(account);
    calculateBalance(account);
    calculateSummary(account);
}

function startLogoutTimer(){

    const tick = function(){

        const minutes = Math.trunc(time / 60);
        const seconds = time % 60;

        // When 0 seconds, logout user
        if(time === 0){

            clearInterval(timer);
            containerApp.style.opacity = 0;
            labelWelcome.textContent = 'Log in to get started';

        }

        // In each call, print/update remaining time to UI
        labelTimer.textContent = `${`${minutes}`.padStart(2, 0)}:${`${seconds}`.padStart(2, 0)}`;

        // Decrease time
        time--;

    };

    // Set time to 5 minutes
    let time = 300;

    tick();
    // Call timer every second
    const timer = setInterval(tick, 1000);

    return timer;

}

///////////////////////////////////////
// Event handlers

let currentAccount;
let timer;

btnLogin.addEventListener('click', function(e){
    // Prevent form from submitting
    e.preventDefault();
    
    currentAccount = accounts.find(function(account) {
        return account.username === inputLoginUsername.value;
    })
    
    if(currentAccount?.pin === Number(inputLoginPin.value)){
        labelWelcome.textContent = `Welcome back, ${currentAccount.owner.split(' ')[0]}`;
        containerApp.style.opacity = 100;
        const currDate = new Date();
        labelDate.textContent = `As of ${`${currDate.getMonth()+1}`.padStart(2, 0)}/${`${currDate.getDate()}`.padStart(2, 0)}/${currDate.getFullYear()}, ${`${currDate.getHours()}`.padStart(2, 0)}:${`${currDate.getMinutes()}`.padStart(2, 0)}`;
        inputLoginUsername.value = '';
        inputLoginPin.value = '';
        inputLoginPin.blur();
        if(timer) clearInterval(timer);
        timer = startLogoutTimer();
        updateUI(currentAccount);
    }

});

btnTransfer.addEventListener('click', function(e) {
    e.preventDefault();

    const amount = Number(inputTransferAmount.value);
    const recieverAccount = accounts.find(function(account){
        return account.username === inputTransferTo.value;
    });

    inputTransferAmount.value = '';
    inputTransferTo.value = '';
    
    if (amount > 0 && recieverAccount 
        && currentAccount.balance >= amount 
        && recieverAccount?.username !== currentAccount.username){
        
        currentAccount.movements.push(-amount);
        recieverAccount.movements.push(amount);

        currentAccount.movementsDates.push(new Date().toISOString());
        recieverAccount.movementsDates.push(new Date().toISOString());

        updateUI(currentAccount);

        clearInterval(timer);
        timer = startLogoutTimer();
    }
});

btnClose.addEventListener('click', function(e) {
    e.preventDefault();

    if(inputCloseUsername.value === currentAccount.username && Number(inputClosePin.value) === currentAccount.pin){

        const indexToDelete = accounts.findIndex(function(account) {
            return account.username === currentAccount.username;
        });

        inputCloseUsername.value = '';
        inputClosePin.value = '';

        accounts.splice(indexToDelete, 1);

        containerApp.style.opacity = 0;

    }
});

btnLoan.addEventListener('click', function(e) {
    e.preventDefault();

    clearInterval(timer);
    timer = startLogoutTimer();

    const amount = Math.floor(Number(inputLoanAmount.value));

    if(amount > 0 && currentAccount.movements.some(function(trans) {
        return trans >= amount * 0.1;
    })){
        setTimeout(function() {
            currentAccount.movements.push(amount);
            currentAccount.movementsDates.push(new Date().toISOString());
            updateUI(currentAccount);
        }, 5000);
        inputLoanAmount.value = '';
    }
});

let sorted = false;

btnSort.addEventListener('click', function(e) {
    e.preventDefault();

    displayMovements(currentAccount, !sorted);
    sorted = !sorted;
});

/////////////////////////////////////////////////
/////////////////////////////////////////////////
// LECTURES

// All numbers are floating point numbers, 23 === 23.0 is true

// Number('1') === +'1' since the + operator converts to number

// Number.parseInt(string) where string is a string of numbers
// The above also works if the string is aplhanumeric (contains letters) but it starts out
// number. The same is not true if the string starts with a letter. Leading and trailing
// whitespaces are also not an issue.

// Number.parseInt('1') === 1
// Number.parseInt('30px') === 30
// Number.parseInt('i5') === NaN

// parseInt() has a second argument that accepts the number system (base 10, base 16, base 2, etc.)

// Number.parseFloat() does the same for decimal numbers
// Number.parseInt('2.5rem') === 2
// Number.parseFloat('2.5rem') === 2.5

// Number.isNaN(i) returns true/false wether i === NaN

// Number.isFinite(i) returns true/false wether i === Infinity
// isFinite() returns false for NaN so it is the preferred method to use to check
// if a value is a number.

// Number.isInteger(i) checks if i is an integer

// MATH / ROUNDING

/**
 * Math.sqrt(i) returns square root of i
 * i ** (1/2) does the same
 * i ** (1/n) takes the nth rooth of i
 * 
 * Math.max(num1, ..., numi) returns the max of the passed in numbers
 * if numk, where 1 <= k <= i, is a number in a string (without letters/symbols) then it is a
 * valid input.
 * 
 * Math.max(1, 2, 3) === 3
 * Math.max(1, '2', '3') === 3
 * 
 * Math.min() returns the min value
 * 
 * Math.PI is the PI constant
 * 
 * Math.random() generates a number between 0 and 1
 * Math.random() * i generates a number between 0 and i-n including all decimals where n approaches negative Infinity
 * Math.trunc(Math.random() * i) generates an integer between 0 and i-1
 * Math.trunc(Math.random() * i+1) generates an integer between 0 and i
 * 
 * Math.trunc() removes the decimal portion of a number 
 * 
 * To generate a number between a max and a min value we do 
 * Math.trunc(Math.random() * (max-min) + 1)
 * 
 * Math.round() rounds to nearest integer
 * 
 * Math.floor() rounds down to the nearest integer
 * Math.ceil() rounds up to the nearest integer
 * 
 * Math.trunc(i) === Math.floor(i) unless i is negative
 * 
 * Math.trunc(-2.5) === -2
 * Math.floor(-2.5) === -3
 * 
 * The toFixed method, used on an instance of Number, rounds the number to the specified place
 * but returns the result as a string.
 * (2.5).toFixed(0) returns '3'
 * (2.5).toFixed(3) returns '2.500'
 * Number((2.5).toFixed(0)) returns 3
 */


// NUMERIC SEPARATORS

/**
 * These are like commas for really large numbers so they are more readable.
 * 
 * For a number declaration we can simply do
 * const num = 287_460_000_000
 * 
 * JavaScript ignores the underscores so the value of num in memory will be 287460000000. This also
 * means we can place the underscores anywhere.
 * 
 * For decimal numbers, we cannot place underscores next to decimal points or other underscores.
 * 
 * If you convert a string to and number, if the string is a number with an underscore, it will not 
 * be able to convert it to number.
 */

// BIGINT

/**
 * The max number value is (2^53) - 1 due to binary representations. Of the 64 bits used to store a number, 
 * 53 are used to store the actual number.
 * 
 * BigInt is a new primitive that stores integers larger than the above value. For a number i s.t.
 * i >= 2^53, we declare a BigInt in two ways:
 * const bigint = in; //the n at the end of the number makes it a BigInt
 * BigInt(i);
 * 
 * Every instance of BigInt must have the n at the end. BigInts can have math/arithmetic done in the same
 * way as normal numbers except BigInts cannot be combined with normal numbers.
 * 89457934340932898573498n + 389304893n is allowed but
 * 23948032840328409380945832n + 329884 is not so we convert it to BigInt
 * 23948032840328409380945832n + BigInt(329884) or
 * bigNum + BigInt(smallNum)
 * 
 * 20n > 15 is true
 * 20n === 20 is false
 * 20n == 20 is true
 * 
 * String conversion is as usual on BigInts
 * 
 * 10n / 3n === 3 // there is rounding to nearest integer
 */

// DATES

/**
 * new Date() returns current date
 * 
 * new Date(dateString) will parse the given string into a date
 * 
 * We can pass multiple args in the form
 * new Date(year, month, day, hour, minutes, seconds)
 * 
 * Note that the month is zero based so 0 is January and 11 is December.
 * The Date() function corrects some invalid dates, If you pass in November 31st, which is not
 * a real date since the last day of November is the 30th, then it date function will
 * return December 1st. If you pass in November 33rd, it will return December 3rd.
 * 
 * new Date(millis) will return the date the specified number of milliseconds past 
 * the date January 1st, 1970, the start date of UNIX
 * 
 * A useful number is the timestamp which is a conversion of a number of days to milliseconds
 * We multiply the number of days by 24 hours, 60 minutes, 60 seconds, and 1000 milliseconds.
 * 
 * 3 * 24 * 60 * 60 * 1000 is the timestamp for January 4th, 1970 or 3 days after January 1st, 1970.
 * 
 * Suppose we have const date = new Date()
 * 
 * date.getFullYear() returns the year
 * date.getMonth() returns the month value as a number (zero-based)
 * date.getDate() returns the day as a number
 * date.getDay() returns day of the week as a number (zero-based)
 * date.getHours() returns the hour
 * date.getMinutes() returns the minutes
 * date.getSeconds() returns the second
 * date.getTime() returns timestamp
 * 
 * Date.now() gets timestamp for current date
 * 
 * For all the above get methods there are setters that allow us to change a specific part of the date.
 * 
 * date.setFullYear(2040); //changes year to 2040
 * 
 * Converting a date to a number or string will return the timestamp
 * 
 * if we add/substract dates the operations will occur on the timestamps which we can revert back to dates.
 * 
 * We can revert a timestamp back to a date by doing the opposite conversion
 * timestamp / (1000 * 60 * 60 * 24) or after an operation
 * (date2 - date1) / (1000 * 60 * 60 * 24)
 */

// TIMERS

// First arg is a callback function, and the second arg is an amount of time in milliseconds
// setTimeout() will call the callback function after the specified time passes
// We can add args past the timer, every arg we pass after will be sent as args to the callback function
setTimeout(function(food){ console.log(`${food} is Ready`); }, 3000, 'Pizza');

// We can set the above timer to a variable
// In the code following, we can run the function clearTimeout(timer)
// In this case timer is the var assigned to a setTimeout() function
// clearTimeout() will stop execution of the timer as long as it is asynchronously called before the timer executes

// setInterval() is similar to setTimeout() except it continuously calls the callback function
// every i milliseconds where i is the time passed to the function
// The below code logs the current date every second
// setInterval(() => console.log(new Date()), 1000);