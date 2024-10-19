import User from "../../database/models/user";

class APIFilters {
  constructor(query, queryStr) {
    this.query = query;
    this.queryStr = queryStr;
  }

  search() {
    const filters = {};

    if (this.queryStr.name && this.queryStr.name.trim() !== "") {
      filters.name = {
        $regex: this.queryStr.name,
        $options: "i",
      };
    }

    if (this.queryStr.author && this.queryStr.author.trim() !== "") {
      // First, find the authors that match the search criteria
      return User.find({
        name: { $regex: this.queryStr.author, $options: "i" },
      })
        .select("_id")
        .then((authors) => {
          // Get the IDs of matching authors
          const authorIds = authors.map((author) => author._id);

          // Add author filter to the main query
          filters.author = { $in: authorIds };

          // Apply all filters
          this.query = this.query.find(filters);

          return this;
        });
    } else {
      // If no author filter, apply other filters directly
      this.query = this.query.find(filters);
      return this;
    }
  }

  sort() {
    if (this.queryStr.sort) {
      const [field, order] = this.queryStr.sort.split("_");
      this.query = this.query.sort({ [field]: order === "asc" ? 1 : -1 });
    }
    return this;
  }

  filter() {
    const queryCopy = { ...this.queryStr };
    const removeFields = [
      "page",
      "name",
      "author",
      "createdAtStart",
      "createdAtEnd",
      "sort",
    ];
    removeFields.forEach((el) => delete queryCopy[el]);

    // Handle date range
    if (this.queryStr.createdAtStart || this.queryStr.createdAtEnd) {
      queryCopy.createdAt = {};
      if (this.queryStr.createdAtStart && this.queryStr.createdAtStart !== "") {
        queryCopy.createdAt.$gte = new Date(this.queryStr.createdAtStart);
      }
      if (this.queryStr.createdAtEnd && this.queryStr.createdAtEnd !== "") {
        queryCopy.createdAt.$lte = new Date(this.queryStr.createdAtEnd);
      }
    }

    // Apply remaining filters
    if (Object.keys(queryCopy).length > 0) {
      this.query = this.query.find(queryCopy);
    }

    return this;
  }

  pagination(resPerPage) {
    const currentPage = Number(this.queryStr.page) || 1;
    const skip = resPerPage * (currentPage - 1);

    this.query = this.query.limit(resPerPage).skip(skip);
    return this;
  }
}

export default APIFilters;
