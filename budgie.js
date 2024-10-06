document.getElementById('preferencesForm').addEventListener('submit', function(event) {
    event.preventDefault(); // Prevent form submission

    // Get all preference values
    const housingPref = parseInt(document.getElementById('housingPref').value);
    const groceriesPref = parseInt(document.getElementById('groceriesPref').value);
    const transportPref = parseInt(document.getElementById('transportPref').value);
    const subscriptionsPref = parseInt(document.getElementById('subscriptionsPref').value);
    const leisurePref = parseInt(document.getElementById('leisurePref').value);
    const savingsPref = parseInt(document.getElementById('savingsPref').value);
    
    // Create an array of preferences
    const preferences = [housingPref, groceriesPref, transportPref, subscriptionsPref, leisurePref, savingsPref];

    // Filter out zero values
    const nonZeroPreferences = preferences.filter(pref => pref !== 0);
    
    // Check for duplicate non-zero values
    const uniqueNonZeroPreferences = new Set(nonZeroPreferences);
    if (uniqueNonZeroPreferences.size !== nonZeroPreferences.length) {
        alert('Preferences must have unique non-zero ratings!');
        return; // Exit the function if there are duplicates in non-zero values
    }

    const incomeValue = parseFloat(document.getElementById('income').value);

    // Calculate total preference sum
    const totalPreference = preferences.reduce((total, value) => total + value, 0);
    
    // Suggested percentages (out of 100%)
    const rentPercentage = (housingPref / totalPreference) * incomeValue;
    const groceriesPercentage = (groceriesPref / totalPreference) * incomeValue;
    const transportPercentage = (transportPref / totalPreference) * incomeValue;
    const subscriptionsPercentage = (subscriptionsPref / totalPreference) * incomeValue;
    const leisurePercentage = (leisurePref / totalPreference) * incomeValue;
    const savingsPercentage = (savingsPref / totalPreference) * incomeValue;

    // Display the suggested percentages
    const suggestionsDiv = document.getElementById('suggestions');
    suggestionsDiv.innerHTML = `
        <p>Rent: £${rentPercentage.toFixed(2)}</p>
        <p>Groceries: £${groceriesPercentage.toFixed(2)}</p>
        <p>Transport: £${transportPercentage.toFixed(2)}</p>
        <p>Subscriptions: £${subscriptionsPercentage.toFixed(2)}</p>
        <p>Leisure: £${leisurePercentage.toFixed(2)}</p>
        <p>Savings: £${savingsPercentage.toFixed(2)}</p>
    `;
});
