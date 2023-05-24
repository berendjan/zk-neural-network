# AI on the blockchain, zk-proof style

This repo shows how to generate a zk-proof made with [ZoKrates](https://zokrates.github.io/introduction.html) of a neural network made in [PyTorch](https://pytorch.org).

This has clear benefits as the validator run in logarithmic time with respect to the input circuit, enabling the memory and computationally heavy calculations of a neural network to be offloaded from the blockchain network itself.

Furthermore, the input can be a private field enabling authentication applications to use private input data without the risk of exposing user sensitive data, a prime example is **facial recognition**.

As ZoKrates only support unsigned fields, and max 64 bit unsigned integer we had to conjure a fixed precision field combined with a boolean for the sign (see zokrates/signed_field).

As common Neural Network layers only consist of addition and mulitplication this was within the limitations of the zero-knowledge framework.

We implemented fully connected layers and rectified-linear unit layers (ReLU), though convolutional layers would be a trivial extension.

## Setup

```bash
# in python/ directory
python3 -m venv venv
source venv/bin/activate
pip3 install -r requirements.txt
```

## Generate model parameters

```bash
# in python/ directory

# create pytorch model
python3 neural_network.py

# create ZoKrates parameters
python3 generate_zok_params.py

# create run script
python3 generate_run_script.py
```

## Compile, run, output Solidity contract and verify

```bash
# in zokrates/ directory
chmod +x ./run.sh
./run.sh

# to run all zokrates unit tests
./test_run.sh
```
