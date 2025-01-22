// productcontrollers.js 


const ProductModel = require("../models/productModels");

const getProducts = async (req, res) => {
  try {
    const products = await ProductModel.find({});
    res.status(200).json(products);
  } catch (error) {
    res.status(500).send({ message: error.message });
  }
};
const getProductById = async (req, res) => {

  const { id } = req.params;
  try {
    const product = await ProductModel.findById(id);
    if (!product) {
      return res.status(404).json({ message: "product not found!" });
    }
    res.status(200).json(product);
  } catch (error) {
    res.status(500).send({ message: error.message });
  }
};
const deleteProduct = async (req, res) => {
  const { id } = req.params;
  try {
    const product = await ProductModel.findByIdAndDelete(id);
    if (!product) {
      return res.status(404).json({ message: "product not found!" });
    }
    res.status(200).json({
      message: "deleted successfully!",
      deletedProdouct: product,
    });
  } catch (error) {
    res.status(500).send({ message: error.message });
  }
};

const addNewData = async (req, res) => {
  console.log(req.body);

  try {
    const newProduct = ProductModel({ ...req.body });
    await newProduct.save();
    res.json({ message: "product added successfully", newProduct: newProduct });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
const updateData = async (req, res) => {
  const { id } = req.params;
  try {
    const updatedProduct = await ProductModel.findByIdAndUpdate(
      id,
      {
        ...req.body,
      },
      { new: true }
    );
    if (!updatedProduct) {
      return res.status(404).json({ message: "product not found!" });
    }
    res.json({
      message: "product updated successfully",
      updatedProduct: updatedProduct,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getProducts,
  getProductById,
  deleteProduct,
  addNewData,
  updateData,
};




// productModels.js

const mongoose = require("mongoose");

// const { Schema } = mongoose;

const Schema = mongoose.Schema;

const ProductSchema = new Schema(
  {
    title: { type: String, required: true },
    price: { type: Number, required: true },
    description: { type: String, required: true },
    imageUrl: { type: String, required: true },
    raiting: { type: Number },
    oldPrice: { type: Number },
    category: { type: String },
  },
  { timestamps: true }
);

const ProductModel = mongoose.model("Products", ProductSchema);

module.exports = ProductModel;




// productRoutes.js
const express = require("express");
const {
  getProducts,
  getProductById,
  deleteProduct,
  addNewData,
  updateData,
} = require("../controllers/productControllers");

const router = express.Router();

router.get("/", getProducts);
router.get("/:id", getProductById);
router.delete("/:id", deleteProduct);
router.post("/", addNewData);
router.put("/:id", updateData);

module.exports = router;




// index.js

const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const productRouter = require("./routes/productRoutes");

const DB_URL =
  "mongodb+srv://ibrahimiiazmp202:ibrahim9501@cluster0.mmdfg.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";
const PASSWORD = "ibrahim9501";
const PORT = 8080;
const app = express();
app.use(cors());


app.use(express.json());
app.use("/api/products", productRouter);

mongoose.connect(DB_URL).then(() => {
  console.log("Connected!");
  app.listen(PORT, () => {
    console.log(`Example app listening on port ${PORT}`);
  });
});

// client
// constants  
export const BASE_URL = "http://localhost:8080/api/";




// wishlistcontext.js
import { createContext, useState } from "react"


export const WishlistContext = createContext(null);

const WishlistProvider = ({ children }) => {
    const [wishlist, setWishlist] = useState([])

    console.log(wishlist);


    const toggleWishlist = (product) => {
        const idx = wishlist.findIndex((q) => q._id === product._id)
        if (idx === -1) {
            setWishlist([...wishlist, { ...product }])
        } else {
            setWishlist([...wishlist].filter((q) => q._id !== product._id))
        }
    }
    return (
        <WishlistContext.Provider value={{ wishlist, toggleWishlist }}>{children}</WishlistContext.Provider>
    )
}

export default WishlistProvider




// header
import { NavLink } from "react-router-dom"
import styles from "./index.module.scss"
const Header = () => {
    return (
        <header>
            <div className="container">
                <div className={styles["header"]}>
                    <img className="logo" src="https://preview.colorlib.com/theme/wines/images/logo.png" />
                    <nav>
                        <ul>
                            <li>
                                <NavLink to={"/"}>Home</NavLink>
                            </li>
                            <li>
                                <NavLink to={"/about"}>About</NavLink>
                            </li>
                            <li>
                                <NavLink to={"/shop"}>Shop</NavLink>
                            </li>
                            <li>
                                <NavLink to={"/wishlist"}>Wishlist</NavLink>
                            </li>
                            <li>
                                <NavLink to={"/add"}>Add</NavLink>
                            </li>
                        </ul>
                    </nav>
                </div>
            </div>
        </header>
    )
}

// export default Header
// header {
//     .header {
//       display: flex;
//       flex-direction: column;
//       align-items: center;
//       gap: 0.5rem;
//       padding: 2rem 0;
//       .logo {
//       }
//       nav {
//         ul {
//           display: flex;
//           gap: 2rem;
//         }
//       }
//     }
//   }


// MAINLAYOUT
import { Outlet } from "react-router-dom"
import Footer from "../Footer"
import Header from "../Header"

const MainLayout = () => {
    return (
        <div>
            <Header />
            <Outlet />
            <Footer />
        </div>
    )
}

export default MainLayout


// ADD PAGES
import { Formik, Form, Field } from 'formik';
import * as Yup from 'yup';
import Container from '@mui/material/Container';
import styles from "./index.module.scss"
import axios from 'axios';
import { BASE_URL } from '../../constants';

import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import { useEffect, useState } from 'react';
import { getProducts } from '../../../../server/controllers/productControllers';


const productSchema = Yup.object().shape({
    title: Yup.string()
        .min(2, 'Too Short!')
        .max(50, 'Too Long!')
        .required('Required'),
    description: Yup.string()
        .min(2, 'Too Short!')
        .max(50, 'Too Long!')
        .required('Required'),
    price: Yup.number().required('Required'),
    imageUrl: Yup.string().required('Required'),
});

const Add = () => {
    const [product, setproduct] = useState([])

    const getProducts = async () => {
        try {
            const res = await axios(`${BASE_URL}products`)
            setproducts(res.data)
        } catch (error) {
            console.log(error);
        }
    }


    const handleDelete = async (id) => {
        try {
            const res = await axios.delete(`${BASE_URL}products/${id}`)
            console.log(res);
            if (res.status === 200) {
                setproducts([...wines].filter((q) => q._id !== id))
            }

        } catch (error) {
            console.log(error);


        }
    }
    useEffect(() => {
        getProducts()
    }, [])

    return <div id={styles["add"]}>

        <Container maxWidth="sm">


            <h1>Add product</h1>

            <Formik
                initialValues={{
                    title: '',
                    price: '',
                    description: '',
                    imageUrl: '',
                }}
                validationSchema={productSchema}
                onSubmit={async (values, { resetForm }) => {
                    console.log(values);

                    const product = { ...values, raiting: 5, oldPrice: null }
                    const res = await axios.post(`${BASE_URL}products`, wine)
                 
                    resetForm()
                   

                }}
            >
                {({ errors, touched }) => (
                    <Form style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                        <div>
                            <Field name="title" />
                            {errors.title && touched.title ? (
                                <div>{errors.title}</div>
                            ) : null}
                        </div>
                        <div>
                            <Field name="price" type={"number"} />
                            {errors.price && touched.price ? (
                                <div>{errors.price}</div>
                            ) : null}
                        </div>
                        <div>
                            <Field name="description" type="text" />
                            {errors.description && touched.description ? <div>{errors.description}</div> : null}
                        </div>
                        <div>
                            <Field name="imageUrl" type="url" />
                            {errors.imageUrl && touched.imageUrl ? <div>{errors.imageUrl}</div> : null}
                        </div>
                        <button type="submit">Submit</button>
                    </Form>
                )}
            </Formik>


            <hr />
            <TableContainer >
                <Table aria-label="simple table">
                    <TableHead>
                        <TableRow>
                            <TableCell align="right">Image</TableCell>
                            <TableCell align="right">Title</TableCell>
                            <TableCell align="right">Description</TableCell>
                            <TableCell align="right">Actions</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {products.length > 0 && products.map((row) => (
                            <TableRow
                                key={row._id}
                                sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                            >
                                <TableCell align="right"><img src={row.imageUrl} alt="" style={{ width: "100px" }} /></TableCell>
                                <TableCell align="right">{row.title}</TableCell>
                                <TableCell align="right">{row.description}</TableCell>
                                <TableCell align="right">
                                    <button onClick={() => { window.confirm("are u sure to delete?") && handleDelete(row._id) }}>Delete</button>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>
        </Container>
    </div>

};

// export default Add
// #add {
//     h1 {
//       margin: 2rem;
//       text-align: center;
//     }
//     form {
//       input {
//         width: 100%;
//       }
//     }
//   }

// HOME PAGE
import { useContext, useEffect, useState } from "react";
import { BASE_URL } from "../../constants";
import axios from "axios";

import styles from "./index.module.scss";
import Grid from '@mui/material/Grid2';
import Rating from '@mui/material/Rating';

import { LuShoppingCart } from "react-icons/lu";
import { FaInfoCircle } from "react-icons/fa";
import { FaRegHeart } from "react-icons/fa";
import TextField from '@mui/material/TextField';
import { Helmet } from "react-helmet-async";
import { Link } from "react-router-dom";
import { WishlistContext } from "../../context/wishlistContext";
import Wishlist from "./fullstack1/client/src/pages/Wishlist";



const Home = () => {
    const [products, setproducts] = useState([])
    const [productsCopy, setproductsCopy] = useState([])
    const [searchQuery, setSearchQuery] = useState("")


    const { toggleWishlist } = useContext(WishlistContext)

    const categories = ["all", "red", "white", "homemade"]


    const getproducts = async () => {
        try {
            const res = await axios(`${BASE_URL}products`)
            // console.log(res.data);
            setproducts(res.data)
            setproductsCopy(res.data)
        } catch (error) {
            console.log(error);
        }
    }

    const filteredProducts = products.filter((p) => p.title.toLowerCase().includes(searchQuery.toLowerCase().trim()))
    useEffect(() => {
        getproducts()
    }, [])


    const handleChange = (e) => {
        let sortedproducts = null;
        console.log(e.target.value);
        if (e.target.value === "asc") {
            sortedproducts = [...products].toSorted((a, b) => a.price - b.price)
        } else if (e.target.value === "desc") {
            sortedproducts = [...products].toSorted((a, b) => b.price - a.price)
        } else {
            sortedproducts = [...productsCopy]
        }
        setProducts([...sortedproducts])
    }


    const handleFilter = (category) => {
        if (category !== "all") {
            setProducts([...productsCopy].filter((q) => q.category === category))
        } else {
            setProducts([...productsCopy])
        }
    }
    return (

        <>
            <Helmet>
                <title>Home Page</title>
                <meta name="description" content="products page" />
            </Helmet>
            <div>


                <div className="container">

                    <div style={{ margin: "1rem 0", display: "flex", justifyContent: "space-between" }}>
                        <TextField id="outlined-basic" label="Search" variant="outlined" onChange={(e) => { setSearchQuery(e.target.value) }} />


                        <div style={{ display: "flex", gap: "1rem" }}>
                            {categories.map((c) => {
                                return <button key={c} style={{ padding: "0 1rem" }} onClick={() => { handleFilter(c) }}>{c}</button>
                            })}
                        </div>
                        <select name="" id="" onChange={handleChange}>
                            <option value="asc">ASC</option>
                            <option value="desc">DESC</option>
                            <option value="default">DEFAULT</option>
                        </select>
                    </div>
                    <div className={styles.products}>
                        <Grid container spacing={2}>
                            {
                                products.length > 0 && filteredproducts.map((p) => {
                                    return (<Grid size={{ xs: 12, md: 6, lg: 4 }} key={p._id}>
                                        <div className={styles["product"]}>
                                            <img src={p.imageUrl} alt={p.title} />
                                            <h3 className={styles.title}>{p.title}</h3>
                                            <p> {p.oldPrice ? <span className={styles["old-price"]}>$ {p.oldPrice}</span> : ""} $ {p.price}</p>
                                            <p><Rating name="half-rating" defaultValue={p.raiting} />
                                            </p>
                                            <button className={styles["cart"]}> <LuShoppingCart />
                                                Add to Cart</button>
                                            <div style={{ display: "flex", gap: "1rem" }}>
                                                <Link to={`products/${p._id}`}><FaInfoCircle /></Link>
                                                <FaRegHeart onClick={() => { toggleWishlist(p) }} />
                                            </div>
                                        </div>
                                    </Grid>)
                                })
                            }
                        </Grid>
                    </div>

                </div>
            </div >
        </>

    )
}

export default Home


// Wishlist page
import { useContext } from "react";

import Grid from '@mui/material/Grid2';
import Rating from '@mui/material/Rating';
import styles from "./index.module.scss"
import { LuShoppingCart } from "react-icons/lu";
import { FaInfoCircle } from "react-icons/fa";
import { FaRegHeart } from "react-icons/fa";
import { Helmet } from "react-helmet-async";
import { Link } from "react-router-dom";
import { WishlistContext } from "../../context/wishlistContext";



const Wishlist = () => {



    const { wishlist, toggleWishlist } = useContext(WishlistContext)






    return (

        <>
            <Helmet>
                <title>wishlist</title>
                <meta name="description" content="wishlist page" />
            </Helmet>
            <div>


                <div className="container">


                    <div className={styles.products}>
                        <Grid container spacing={2}>
                            {
                                wishlist.length > 0 && wishlist.map((p) => {
                                    return (<Grid size={{ xs: 12, md: 6, lg: 4 }} key={p._id}>
                                        <div className={styles["product"]}>
                                            <img src={p.imageUrl} alt={p.title} />
                                            <h3 className={styles.title}>{p.title}</h3>
                                            <p> {p.oldPrice ? <span className={styles["old-price"]}>$ {p.oldPrice}</span> : ""} $ {p.price}</p>
                                            <p><Rating name="half-rating" defaultValue={p.raiting} />
                                            </p>
                                            <button className={styles["cart"]}> <LuShoppingCart />
                                                Add to Cart</button>
                                            <div style={{ display: "flex", gap: "1rem" }}>
                                                <FaRegHeart onClick={() => { toggleWishlist(p) }} />
                                            </div>
                                        </div>
                                    </Grid>)
                                })
                            }
                        </Grid>
                    </div>

                </div>
            </div>
        </>

    )
}

export default Wishlist



// app.jsx
import './App.css'
import { Routes, Route } from "react-router-dom"
import MainLayout from './layouts/MainLayout'
import Home from './pages/Home'
import Details from './pages/Details'
import Add from './pages/Add'
import NotFound from './pages/NotFound'
import Wishlist from './pages/Wishlist'
function App() {

  return (
    <>

      <Routes>
        <Route path='/' element={<MainLayout />}>
          <Route index element={<Home />} />
          <Route path='/wines/:id' element={<Details />} />
          <Route path='/add' element={<Add />} />
          <Route path='/wishlist' element={<Wishlist />} />

          <Route path='*' element={<NotFound />} />
        </Route>
      </Routes>
    </>
  )
}

export default App

// main.jsx
import { BrowserRouter } from "react-router-dom";
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { HelmetProvider } from 'react-helmet-async';
import WishlistProvider from "./context/wishlistContext.jsx";

createRoot(document.getElementById('root')).render(
  <BrowserRouter>
    <HelmetProvider>
      <WishlistProvider>
        <App />
      </WishlistProvider>
    </HelmetProvider>
  </BrowserRouter>

)
