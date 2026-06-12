Author: Yahya Al Malallah [yahyaalmalallah@arizona.edu](mailto:yahyaalmalallah@arizona.edu)  
Date: 4/22/2024

# Transfer Functions


## Overview
This project is designed to initialize and update transfer functions for color and opacity, designed to enhance the visualization of scalar data within a web-based application.

## File Structure
- `index.html`: HTML file that provides the structure for displaying the visualizations.
- `a10.js`: JavaScript file containing the code for initializing and updating transfer functions for color and opacity to enhance the visualization.
- `d3.js`: Includes the D3.js library functionalities, which are essential for the dynamic aspects of the data visualization.
- `volren.js`: This file provides the functions to create the vtk.js volume renderer canvas as well as to update its transfer functions.
- `vtk.js`: Incorporates the vtk.js library functionalities, crucial for executing 3D data visualization tasks within web environments. This file is instrumental in constructing and managing 3D visual representations and interactions in the volume renderer, ensuring efficient and high-performance visualization of complex datasets.

## Datasets
The datasets folder contains pre-configured .vti files used for demonstrating the visualization tool's capabilities. Each file represents a different type of volumetric data, suitable for testing and showcasing various aspects of volume rendering:

- `engine.vti`: Contains 3D data representing the internal structure of an engine, ideal for analyzing complex mechanical components.
- `fuel.vti` : Includes volumetric data of fuel flow dynamics, useful for studies in fluid dynamics and fuel system analyses.
- `hydrogeon.vti` : Features hydrogeological volumetric data, appropriate for environmental science and studies related to groundwater flow.
- `tooth.vti` : Provides a detailed scan of a tooth, commonly used in dental research and educational contexts.

## How to Use
1. Clone the repository to your local machine.
2. Open the `index.html` file in a web browser to view the isocontours visualization.

NOTE: It is recommended to use Google Chrome for viewing the visualization, as it supports all features without any compatibility issues.

If using VSCode:
- You can enhance your experience by using the "Live Server" extension to serve the project, which provides instant feedback on any code changes.
