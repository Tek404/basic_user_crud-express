const express = require('express');
const bodyParser = require('body-parser');
const { Pool } = require('pg');
const fs = require('fs').promises;
const path = require('path');

const app = express();
const port = 3000;

// connect to db
const pool = new Pool({
    user: 'postgres',
    host: 'localhost',
    database: 'sunwaymoney_customer', 
    password: 'admin',
    port: 5432,
});

// middlewares
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// serve html
app.use(express.static('public'));

// helper function
function addToUpdateFieldsAndValues(field, value, fieldsArray, valuesArray) {
  if (value) {
    fieldsArray.push(field);
    valuesArray.push(value);
  }
}

// routes
app.get('/customerAdd', (req, res) => {
    res.sendFile(__dirname + '/public/customerAdd.html');
});

app.get('/customerEdit', (req, res) => {
    res.sendFile(__dirname + '/public/customerEdit.html');
});
app.get('/customerList', (req, res) => {
    res.sendFile(__dirname + '/public/customerList.html');
});

// routes
// fetch all customer from db
app.get('/getCustomers', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM users');
    const customerList = result.rows;

    res.json(customerList);
  } catch (error) {
    console.error('Error fetching customer list:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// search customers by name
app.get('/searchCustomers', async (req, res) => {
  try {
    let searchQuery;
    let queryParams;

    if (req.query.name) {
      // search by name
      searchQuery = 'SELECT * FROM users WHERE LOWER(name) LIKE $1';
      queryParams = [`%${req.query.name.toLowerCase()}%`];
    } else if (req.query.icNumber) {
      // search by IC number
      searchQuery = 'SELECT * FROM users WHERE LOWER(ic_number) LIKE $1';
      queryParams = [`%${req.query.icNumber.toLowerCase()}%`];
    } else {
      return res.status(400).json({ message: 'Invalid search parameters' });
    }

    const result = await pool.query(searchQuery, queryParams);
    const customerList = result.rows;

    res.json(customerList);
  } catch (error) {
    console.error('Error searching customers:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// add customer
app.post('/submitForm', async (req, res) => {
  try {
      const { name, icNumber, dob, address, addressCountry, addressPostcode } = req.body;

      
      // backend validation
      if (name.length > 100) {
          return res.status(400).json({ success: false, message: 'Name should be at most 100 characters.' });
      }

      if (!/^\d*$/.test(icNumber) || icNumber.length > 14) {
          return res.status(400).json({ success: false, message: 'IC Number should contain only digits and be at most 14 characters.' });
      }

      // validate dob 18 years
      const dobDate = new Date(dob);
      const currentDate = new Date();
      const minAgeDate = new Date(currentDate.getFullYear() - 18, currentDate.getMonth(), currentDate.getDate());
      if (dobDate > minAgeDate) {
          return res.status(400).json({ success: false, message: 'You must be at least 18 years old to register.' });
      }

      if (address.length > 100) {
          return res.status(400).json({ success: false, message: 'Address should be at most 100 characters.' });
      }

      const allowedCountries = ['Malaysia', 'Singapore'];
      if (!allowedCountries.includes(addressCountry)) {
          return res.status(400).json({ success: false, message: 'Invalid address country.' });
      }

      if (!/^\d*$/.test(addressPostcode) || addressPostcode.length > 20) {
          return res.status(400).json({ success: false, message: 'Address postcode should contain only digits and be at most 20 characters.' });
      }

      const result = await pool.query(
          'INSERT INTO users (name, ic_number, dob, address, address_country, address_postcode) VALUES ($1, $2, $3, $4, $5, $6) RETURNING user_id',
          [name, icNumber, dob, address, addressCountry, addressPostcode]
      );

      const insertedUserId = result.rows[0].user_id;

      res.status(201).json({
          success: true,
          message: 'Data inserted successfully!',
          userId: insertedUserId
      });
  } catch (error) {
      console.error('Error handling form submission:', error);
      res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

// prefill customer info
app.get('/customerEdit/:id', async (req, res) => {
  const customerId = req.params.id;

  try {
      // fetch data from id
      const result = await pool.query('SELECT * FROM users WHERE user_id = $1', [customerId]);

      if (result.rows.length === 0) {
          return res.status(404).send('Customer not found');
      }

      // read the HTML file to load content
      const htmlFilePath = path.join(__dirname, 'public', 'customerEdit.html');
      let htmlContent = await fs.readFile(htmlFilePath, 'utf-8');

      // modify the HTML content with customer data
      const customerData = result.rows[0];
      htmlContent = htmlContent.replace('<%= customerData.user_id %>', customerData.user_id);
      htmlContent = htmlContent.replace('<%= customerData.name %>', customerData.name);
      htmlContent = htmlContent.replace('<%= customerData.ic_number %>', customerData.ic_number);
      htmlContent = htmlContent.replace('<%= customerData.dob %>', customerData.dob);
      htmlContent = htmlContent.replace('<%= customerData.address %>', customerData.address);
      htmlContent = htmlContent.replace('<%= customerData.address_country %>', customerData.address_country);
      htmlContent = htmlContent.replace('<%= customerData.address_postcode %>', customerData.address_postcode);

      // send the modified HTML
      res.send(htmlContent);
  } catch (error) {
      console.error('Error fetching customer data:', error);
      res.status(500).send('Internal Server Error');
  }
});

// main edit api?
app.patch('/updateCustomer/:id', async (req, res) => {
  const customerId = req.params.id;
  const { editName, editIcNumber, editDob, editAddress, editAddressCountry, editAddressPostcode } = req.body;

  try {
    const updateFields = [];
    const updateValues = [];

    addToUpdateFieldsAndValues('name', editName, updateFields, updateValues);
    addToUpdateFieldsAndValues('ic_number', editIcNumber, updateFields, updateValues);
    addToUpdateFieldsAndValues('dob', editDob, updateFields, updateValues);
    addToUpdateFieldsAndValues('address', editAddress, updateFields, updateValues);
    addToUpdateFieldsAndValues('address_country', editAddressCountry, updateFields, updateValues);
    addToUpdateFieldsAndValues('address_postcode', editAddressPostcode, updateFields, updateValues);

    // construct dynamic query based on changed fields
    const dynamicUpdateQuery = updateFields.map((field, index) => `${field} = $${index + 1}`).join(', ');

    // update data query
    await pool.query(
      `UPDATE users SET ${dynamicUpdateQuery} WHERE user_id = $${updateValues.length + 1}`,
      [...updateValues, customerId]
    );

    res.json({ success: true, message: 'Customer updated successfully' });
  } catch (error) {
    console.error('Error updating customer data:', error);
    res.status(500).json({ success: false, message: 'Internal Server Error' });
  }
});


app.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`);
});
