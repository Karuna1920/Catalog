const fs = require('fs');

// Utility function to convert a number from any base to decimal
function convertFromBase(number, base) {
    if (base <= 10) {
        return BigInt(parseInt(number, base));  // Convert to BigInt immediately
    }
    
    const digits = '0123456789abcdef';
    let decimal = 0n;
    
    number = number.toLowerCase();
    
    for (let i = 0; i < number.length; i++) {
        decimal = decimal * BigInt(base) + BigInt(digits.indexOf(number[i]));
    }
    
    return decimal;
}

// Function to calculate Lagrange basis polynomial term
function lagrangeTerm(points, j) {
    let num = 1n;
    let den = 1n;
    
    const xj = points[j][0];
    
    for (let i = 0; i < points.length; i++) {
        if (i !== j) {
            const xi = points[i][0];
            num *= BigInt(-xi);  // For x = 0 (to find constant term)
            den *= BigInt(xj - xi);
        }
    }
    
    return { num, den };
}

// Function to find GCD of two BigInts
function gcd(a, b) {
    a = abs(a);
    b = abs(b);
    
    while (b) {
        const temp = b;
        b = a % b;
        a = temp;
    }
    
    return a;
}

// Function to get absolute value of BigInt
function abs(n) {
    return n < 0n ? -n : n;
}

// Function to reduce fraction
function reduceFraction(num, den) {
    const divisor = gcd(num, den);
    
    return {
        num: num / divisor,
        den: den / divisor
    };
}

// Main function to find the secret using Lagrange interpolation
function findSecret(testCase) {
    const { keys, ...points } = testCase;
    
    const { k } = keys;

    // Convert points to array of [x, y] pairs with decoded y values
    const pointsArray = Object.entries(points)
        .slice(0, k)
        .map(([x, data]) => {
            const decodedY = convertFromBase(data.value, parseInt(data.base));
            return [BigInt(x), decodedY];  // Convert x to BigInt
        });

    let resultNum = 0n;
    let resultDen = 1n;

    // Calculate Lagrange interpolation for x = 0
    for (let j = 0; j < pointsArray.length; j++) {
        const yj = pointsArray[j][1];  
        
        const { num, den } = lagrangeTerm(pointsArray, j);
        
        // Multiply current term by yj
        const termNum = yj * num;
        
        // Add to result using fraction addition
        resultNum = resultNum * den + termNum * resultDen;
        
        // Update denominator
        resultDen *= den;

        // Reduce fraction to prevent overflow
        const reduced = reduceFraction(resultNum, resultDen);
        
        resultNum = reduced.num;
        resultDen = reduced.den;
        
     }

     // Ensure positive denominator
     if (resultDen < 0n) {
         resultNum = -resultNum;
         resultDen = -resultDen;
     }

     // Convert to final integer result
     if (resultNum % resultDen !== 0n) {
         throw new Error("Result is not an integer!");
     }

     return resultNum / resultDen;
}

// Main execution for both test cases
function main() {
   const testCase1 = JSON.parse(fs.readFileSync('test_case_1.json'));
   const testCase2 = JSON.parse(fs.readFileSync('test_case_2.json'));

   console.log("Secret for Test Case 1:", findSecret(testCase1).toString());
   console.log("Secret for Test Case 2:", findSecret(testCase2).toString());
}

main();
