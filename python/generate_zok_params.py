import torch
from jinja2 import Environment, FileSystemLoader

model = torch.load("model.pth")

env = Environment(loader=FileSystemLoader("."))
template = env.get_template("parameters.zok.j2")

for name, weights in model.items():
    print(name, weights.shape)

weights = [mod[1] for mod in model.items() if mod[0][-6:] == "weight"]
biases = [mod[1] for mod in model.items() if mod[0][-4:] == "bias"]

precision = 8

rendered = template.render(weights=weights, biases=biases, precision=precision)

output_file = "../zokrates/model_params.zok"

with open(output_file, "w") as f:
    f.write(rendered)

print(f"Rendered weights saved to {output_file}")
