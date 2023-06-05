import torch
from torch.utils.data import DataLoader
from torchvision import datasets
from jinja2 import Environment, FileSystemLoader
from torchvision.transforms import ToTensor, Resize, Compose
import matplotlib.pyplot as plt

size = (14,14)

transform = Compose([Resize(size), ToTensor()])


test_data = datasets.MNIST(
    root="data",
    train=False,
    download=True,
    transform=transform,
)

batch_size = 1

test_dataloader = DataLoader(test_data, batch_size=batch_size)

for X, y in test_dataloader:
    first_X = X
    print(f"Shape of X [N, C, H, W]: {X.shape} {X.dtype}")
    first_y = y
    print(f"Shape of y: {y.shape} {y.dtype} {y}")
    break

test_img = first_X[0][0]


def print_test_img(img):
    rows, cols = 1, 1
    fig, axs = plt.subplots(rows, cols, figsize=(4, 4))
    axs.imshow(-img, cmap="gray")
    axs.axis("off")
    plt.show()


# print_test_img(test_img)


def make_fixed_precision(img):
    return (img.numpy() * 10**8).astype(int)


fixed_precision = make_fixed_precision(test_img)

print(fixed_precision.shape)


env = Environment(loader=FileSystemLoader("."))
template = env.get_template("run.sh.j2")
rendered = template.render(args=fixed_precision, output=first_y.numpy()[0])

output_file = "../zokrates/run.sh"

with open(output_file, "w") as f:
    f.write(rendered)

print(f"Rendered run script saved to {output_file}")
