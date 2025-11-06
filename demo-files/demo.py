"""
BigDaddyG IDE - Python Demo File
Showcasing syntax highlighting and code features
"""

import os
import sys
from datetime import datetime
from typing import List, Dict, Optional


class DataProcessor:
    """Example class for processing data with various methods."""
    
    def __init__(self, name: str):
        self.name = name
        self.data: List[Dict] = []
        self.processed_count = 0
    
    def add_data(self, item: Dict) -> None:
        """Add an item to the data list."""
        self.data.append(item)
        print(f"Added item: {item.get('name', 'Unknown')}")
    
    def process_all(self) -> List[Dict]:
        """Process all data items and return results."""
        results = []
        for item in self.data:
            processed = self._process_item(item)
            results.append(processed)
            self.processed_count += 1
        return results
    
    def _process_item(self, item: Dict) -> Dict:
        """Private method to process a single item."""
        return {
            **item,
            'processed_at': datetime.now().isoformat(),
            'processor': self.name
        }
    
    def get_stats(self) -> Dict[str, int]:
        """Return processing statistics."""
        return {
            'total_items': len(self.data),
            'processed': self.processed_count
        }


def fibonacci(n: int) -> List[int]:
    """
    Generate Fibonacci sequence up to n terms.
    
    Args:
        n: Number of terms to generate
    
    Returns:
        List of Fibonacci numbers
    """
    if n <= 0:
        return []
    elif n == 1:
        return [0]
    
    sequence = [0, 1]
    for i in range(2, n):
        sequence.append(sequence[i-1] + sequence[i-2])
    
    return sequence


def find_prime_numbers(limit: int) -> List[int]:
    """Find all prime numbers up to the given limit."""
    if limit < 2:
        return []
    
    primes = []
    for num in range(2, limit + 1):
        is_prime = True
        for i in range(2, int(num ** 0.5) + 1):
            if num % i == 0:
                is_prime = False
                break
        if is_prime:
            primes.append(num)
    
    return primes


def read_file_safely(filepath: str) -> Optional[str]:
    """
    Safely read a file and return its contents.
    
    Args:
        filepath: Path to the file to read
    
    Returns:
        File contents or None if error occurs
    """
    try:
        with open(filepath, 'r', encoding='utf-8') as file:
            return file.read()
    except FileNotFoundError:
        print(f"Error: File not found - {filepath}")
        return None
    except Exception as e:
        print(f"Error reading file: {e}")
        return None


# Demo usage
if __name__ == "__main__":
    print("=" * 60)
    print("BigDaddyG IDE - Python Demo")
    print("=" * 60)
    
    # Fibonacci demo
    print("\n📊 Fibonacci Sequence (first 10 terms):")
    fib_sequence = fibonacci(10)
    print(fib_sequence)
    
    # Prime numbers demo
    print("\n🔢 Prime Numbers up to 30:")
    primes = find_prime_numbers(30)
    print(primes)
    
    # Data processor demo
    print("\n⚙️ Data Processor Demo:")
    processor = DataProcessor("DemoProcessor")
    processor.add_data({'name': 'Item 1', 'value': 100})
    processor.add_data({'name': 'Item 2', 'value': 200})
    processor.add_data({'name': 'Item 3', 'value': 300})
    
    results = processor.process_all()
    print(f"\nProcessed {len(results)} items")
    print(f"Stats: {processor.get_stats()}")
    
    # System info
    print("\n💻 System Information:")
    print(f"Platform: {sys.platform}")
    print(f"Python Version: {sys.version.split()[0]}")
    print(f"Current Directory: {os.getcwd()}")
    
    print("\n✅ Demo completed successfully!")
    print("=" * 60)

