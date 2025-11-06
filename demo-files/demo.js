// Demo JavaScript file for IDE showcase

class Calculator {
    constructor() {
        this.history = [];
    }
    
    add(a, b) {
        const result = a + b;
        this.history.push(`${a} + ${b} = ${result}`);
        return result;
    }
    
    multiply(a, b) {
        const result = a * b;
        this.history.push(`${a} * ${b} = ${result}`);
        return result;
    }
    
    divide(a, b) {
        if (b === 0) {
            throw new Error('Cannot divide by zero');
        }
        return a / b;
    }
    
    getHistory() {
        return this.history;
    }
    
    clearHistory() {
        this.history = [];
    }
}

// API Service Example
class UserService {
    constructor(apiUrl) {
        this.apiUrl = apiUrl;
        this.cache = new Map();
    }
    
    async fetchUser(userId) {
        // Check cache first
        if (this.cache.has(userId)) {
            return this.cache.get(userId);
        }
        
        try {
            const response = await fetch(`${this.apiUrl}/users/${userId}`);
            const user = await response.json();
            this.cache.set(userId, user);
            return user;
        } catch (error) {
            console.error('Failed to fetch user:', error);
            throw error;
        }
    }
    
    async createUser(userData) {
        const response = await fetch(`${this.apiUrl}/users`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(userData)
        });
        return response.json();
    }
}

// Utility Functions
const utils = {
    debounce(func, delay) {
        let timeout;
        return function(...args) {
            clearTimeout(timeout);
            timeout = setTimeout(() => func.apply(this, args), delay);
        };
    },
    
    throttle(func, limit) {
        let inThrottle;
        return function(...args) {
            if (!inThrottle) {
                func.apply(this, args);
                inThrottle = true;
                setTimeout(() => inThrottle = false, limit);
            }
        };
    },
    
    formatDate(date) {
        return new Intl.DateTimeFormat('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        }).format(date);
    }
};

// Demo usage
const calc = new Calculator();
console.log('5 + 3 =', calc.add(5, 3));
console.log('10 * 4 =', calc.multiply(10, 4));
console.log('History:', calc.getHistory());

const userService = new UserService('https://api.example.com');
// userService.fetchUser(123).then(user => console.log(user));

console.log('Today:', utils.formatDate(new Date()));

