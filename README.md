# Declare Repository [![DOI](https://zenodo.org/badge/875302323.svg)](https://doi.org/10.5281/zenodo.14609574)

A web-based repository for storing, sharing and analyzing DECLARE process models.

![Repository Overview](https://res.cloudinary.com/dv7nhvy8e/image/upload/v1735996892/qh6scjskpjowy4asugoc.png)

## Overview

Declare Repository is a comprehensive platform designed to facilitate the storage, sharing, and analysis of declarative process models expressed in DECLARE notation. The repository aims to promote model reuse and enable benchmarking capabilities within the declarative process modeling community.

## Features

- **Model Management**
  - Upload and store DECLARE process models in multiple formats (.decl, .txt, .png)
  - Browse and search stored models
  - Filter models based on various metrics and characteristics
  - Download models for reuse

- **Metric Analysis**
  - Automatic calculation of key metrics:
    - Size
    - Density  
    - Constraint Variability
    - Number of Activities
    - Number of Constraints
    - Separability
    - Semantic Redundancy
    - Consistency
    - Purpose
    - Application Domain

- **API Integration**
  - RESTful API for programmatic access
  - Comprehensive API documentation via Swagger UI
  - Secure authentication and authorization

## Technology Stack

- **Frontend**: Next.js, React
- **Backend**: Next.js API routes
- **Database**: MongoDB
- **Cloud Services**: 
  - AWS S3 for file storage
  - AWS EC2 for metric computation
- **Deployment**: Vercel

## Getting Started

### Prerequisites

- Node.js 14.x or higher
- MongoDB
- AWS account for S3 and EC2 services

### Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/declare-repo.git
```

2. Install dependencies:
```bash
cd declare-repo
npm install
```

3. Configure environment variables:
```bash
cp .env.example .env.local
```
Edit `.env.local` with your configuration values

4. Run the development server:
```bash
npm run dev
```

## Usage

1. Visit https://declare-repo.vercel.app/
2. Register an account to upload and manage models
3. Browse existing models or upload new ones
4. Use the filtering system to find specific models
5. Download models or analyze their metrics

## API Documentation

Full API documentation is available at https://declare-repo.vercel.app/api-docs

![API Documentation](https://res.cloudinary.com/dv7nhvy8e/image/upload/v1735997029/qfs4quwj3oagfcm7wcsi.png)

## Browser Support

- Chrome 64+
- Edge 79+
- Firefox 67+
- Opera 51+
- Safari 12+

## Release Information  

🎉 **Official Release Date**: *January 16, 2025* 🎉  

The Declare Repository was officially released on January 16, 2025. Since then, it has been empowering the declarative process modeling community with tools for efficient storage, sharing, and analysis of DECLARE process models. Explore the platform, contribute to its growth, and make the most of this innovative repository!  

## Contributing

We welcome contributions to improve the Declare Repository. Please follow these steps:

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Open a Pull Request

## License

This project is licensed under the Apache 2.0 License - see the LICENSE file for details.

## Contact

For questions and support, please open an issue in the GitHub repository.

## Acknowledgments

This project was developed as part of a Master's thesis at the Section for Software Systems Engineering, Department of Applied Mathematics and Computer Science, at the Technical University of Denmark (DTU).

**Project Supervisors:**
- **Andrey Rivkin** - Assistant Professor (Tenure track), Section for Software Systems Engineering, Department of Applied Mathematics and Computer Science, Technical University of Denmark
- **Ekkart Kindler** - Associate Professor, Section for Software Systems Engineering, Department of Applied Mathematics and Computer Science, Technical University of Denmark

Their invaluable guidance, thoughtful feedback, and dedicated support during weekly meetings were instrumental in shaping this research and ensuring its successful completion.
