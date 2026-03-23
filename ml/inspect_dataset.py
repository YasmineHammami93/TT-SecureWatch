
import pandas as pd

try:
    # Read only first few rows to get columns quickly
    data = pd.read_csv("dataset/Train_Test_Network.csv", nrows=5)

    print("Columns:")
    for col in data.columns:
        print(col)

except FileNotFoundError:
    print("Error: Dataset file not found at dataset/Train_Test_Network.csv")
except Exception as e:
    print(f"An error occurred: {e}")
