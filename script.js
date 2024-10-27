// Wait for the DOM to fully load before running the script
document.addEventListener('DOMContentLoaded', function () {
    // Get the form element
    const form = document.querySelector('form');

    // Add an event listener for form submission
    form.addEventListener('submit', function (event) {
        event.preventDefault(); // Prevent the default form submission

        // Get the income value and the selected income type
        const incomeValue = parseFloat(document.getElementById('income').value);
        const incomeType = document.querySelector('input[name="type"]:checked'); // Get the selected radio button
        const rentValue = parseFloat(document.getElementById('rent').value);
        const billsValue = parseFloat(document.getElementById('bills').value);
        const transportValue = parseFloat(document.getElementById('transport').value);
        const groceriesValue = parseFloat(document.getElementById('groceries').value);
        const subscriptionsValue = parseFloat(document.getElementById('subscriptions').value);
        const leisureValue = parseFloat(document.getElementById('leisure').value);
        const shoppingValue = parseFloat(document.getElementById('shopping').value);
        const savingsValue = parseFloat(document.getElementById('savings').value);
        const miscellaneousValue = parseFloat(document.getElementById('miscellaneous').value);

        // Check if an income type was selected
        if (!incomeType) {
            alert('Please select an income type.');
            return; // Exit the function if no type is selected
        }

        // Check if income value is a valid number
        if (isNaN(incomeValue) || incomeValue <= 0) {
            alert('Please enter a valid income amount.');
            return; // Exit if invalid
        } else if (isNaN(rentValue) || rentValue < 0) {
            alert('Please enter a valid rent amount.');
            return; // Exit if invalid
        } else if (isNaN(billsValue) || billsValue < 0) {
            alert('Please enter a valid bills amount.');
            return; // Exit if invalid
        } else if (isNaN(transportValue) || transportValue < 0) {
            alert('Please enter a valid transport amount.');
            return; // Exit if invalid
        } else if (isNaN(groceriesValue) || groceriesValue < 0) {
            alert('Please enter a valid groceries amount.');
            return; // Exit if invalid
        } else if (isNaN(subscriptionsValue) || subscriptionsValue < 0) {
            alert('Please enter a valid subscriptions amount.');
            return; // Exit if invalid
        } else if (isNaN(leisureValue) || leisureValue < 0) {
            alert('Please enter a valid leisure amount.');
            return; // Exit if invalid
        } else if (isNaN(shoppingValue) || shoppingValue < 0) {
            alert('Please enter a valid shopping amount.');
            return; // Exit if invalid
        } else if (isNaN(savingsValue) || savingsValue < 0) {
            alert('Please enter a valid savings amount.');
            return; // Exit if invalid
        } else if (isNaN(miscellaneousValue) || miscellaneousValue < 0) {
            alert('Please enter a valid misciilanous amount.');
            return; // Exit if invalid
        }

        const remainingValue = incomeValue - (rentValue + billsValue + transportValue + groceriesValue + subscriptionsValue + leisureValue + 
            shoppingValue + savingsValue + miscellaneousValue)

        if (remainingValue < 0) {
            alert('Poor budgeting! Your expenses exceed your income.');
            return;
        }

        // Prepare data for the pie chart
        const labels = ['Rent', 'Bills', 'Transport', 'Groceries', 'Subscriptions', 'Leisure', 'Shopping', 'Savings','Miscellaneous', 'Remaining']; // 'Remaining' for the unused part of the pie
        const data = [rentValue, billsValue, transportValue, groceriesValue, subscriptionsValue, leisureValue, shoppingValue, savingsValue, miscellaneousValue, remainingValue]; // Assuming remaining is 100 for illustration

        // Create the pie chart
        const ctx = document.getElementById('myPieChart').getContext('2d');

        // Create a new chart instance
        window.myPieChart = new Chart(ctx, {
            type: 'pie',
            data: {
                labels: labels,
                datasets: [{
                    label: 'Income Type Distribution',
                    data: data,
                    backgroundColor: [
                        '#36A2EB', '#5071DE', '#5540DE', '#8A50DE', '#9422BB', '#FA6CD7', '#C802F6', '#5EBE82', '#4BF4B9', '#9F9ADE'],
                    hoverOffset: 4
                }]
            },
            options: {
                responsive: true,
                plugins: {
                    legend: {
                        position: 'top',
                    },
                    title: {
                        display: true,
                        text: 'Income Visualization'
                    }
                }
            }
        });

    });
});

function appendToResult(value) {
    document.getElementById('result').value += value;
}

function clearResult() {
    document.getElementById('result').value = '';
}

function calculateResult() {
    const resultField = document.getElementById('result');
    try {
        resultField.value = eval(resultField.value); // Evaluate the expression
    } catch (error) {
        resultField.value = 'Error'; // Handle any errors
    }
}