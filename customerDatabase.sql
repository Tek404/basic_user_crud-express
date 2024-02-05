CREATE DATABASE sunwaymoney_customer;

\c sunwaymoney_customer;

CREATE TABLE users (
    user_id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    ic_number VARCHAR(20) NOT NULL,
    dob DATE NOT NULL,
    address TEXT NOT NULL,
    address_country VARCHAR(100) NOT NULL,
    address_postcode VARCHAR(10) NOT NULL
);

CREATE INDEX idx_users_ic_number ON users(ic_number);

INSERT INTO users (name, ic_number, dob, address, address_country, address_postcode)
VALUES
    ('John Doe', '123456-7890', '1990-01-15', '123 Main St', 'Country A', '12345'),
    ('Jane Smith', '987654-3210', '1985-05-20', '456 Oak St', 'Country B', '67890'),
    ('Bob Johnson', '567890-1234', '1982-09-08', '789 Pine St', 'Country C', '23456'),
    ('Emily Davis', '345678-9012', '1995-03-25', '890 Maple Ave', 'Country D', '78901'),
    ('Michael Wilson', '012345-6789', '1978-11-12', '567 Birch Rd', 'Country E', '34567'),
    ('Olivia White', '789012-3456', '1989-07-30', '234 Cedar Ln', 'Country F', '89012'),
    ('David Brown', '456789-0123', '1992-04-18', '678 Elm St', 'Country G', '45678'),
    ('Sophia Miller', '234567-8901', '1983-12-03', '901 Pine Ln', 'Country H', '01234'),
    ('William Taylor', '890123-4567', '1998-08-21', '345 Oak Rd', 'Country I', '56789'),
    ('Emma Harris', '678901-2345', '1980-06-17', '123 Cedar Ave', 'Country J', '12345'),
    ('Christopher Martin', '345678-9012', '1993-02-14', '456 Birch St', 'Country K', '67890'),
    ('Ava Robinson', '012345-6789', '1977-10-29', '789 Elm Ave', 'Country L', '23456'),
    ('Daniel Clark', '789012-3456', '1996-05-06', '890 Pine Rd', 'Country M', '78901'),
    ('Mia Turner', '456789-0123', '1986-01-02', '567 Cedar Ln', 'Country N', '34567'),
    ('Ethan Adams', '234567-8901', '1991-09-19', '901 Maple St', 'Country O', '89012'),
    ('Sophie Scott', '890123-4567', '1984-07-11', '345 Oak Ave', 'Country P', '45678'),
    ('Matthew Lee', '678901-2345', '1997-03-27', '123 Elm Rd', 'Country Q', '01234'),
    ('Amelia Turner', '345678-9012', '1979-11-22', '456 Pine Ave', 'Country R', '56789'),
    ('James Brown', '012345-6789', '1994-08-09', '789 Cedar St', 'Country S', '12345'),
    ('Grace Allen', '789012-3456', '1981-04-04', '890 Maple Rd', 'Country T', '67890'),
    ('Joseph Mitchell', '456789-0123', '1988-12-27', '567 Oak Ln', 'Country U', '23456'),
    ('Charlotte Turner', '234567-8901', '1999-06-14', '901 Pine St', 'Country V', '78901'),
    ('Benjamin White', '890123-4567', '1987-02-01', '345 Cedar Rd', 'Country W', '34567'),
    ('Lily Walker', '678901-2345', '1995-10-16', '123 Elm Ln', 'Country X', '89012'),
    ('Daniel Evans', '345678-9012', '1982-08-03', '456 Birch Ave', 'Country Y', '45678'),
    ('Zoe Hall', '012345-6789', '1990-04-28', '789 Oak St', 'Country Z', '01234');
    ('Sophie Turner', '765432-1098', '1996-09-14', '567 Pine Rd', 'Country AA', '45678'),
    ('Jackson Moore', '210987-6543', '1984-05-03', '890 Elm St', 'Country BB', '01234'),
    ('Ella Wright', '654321-0987', '1992-11-28', '123 Cedar Ave', 'Country CC', '56789'),
    ('Henry Foster', '109876-5432', '1987-07-09', '456 Oak Ln', 'Country DD', '12345');

CREATE OR REPLACE FUNCTION get_all_customers()
RETURNS TABLE (
    user_id INT,
    name VARCHAR(255),
    ic_number VARCHAR(20),
    dob DATE,
    address TEXT,
    address_country VARCHAR(100),
    address_postcode VARCHAR(10)
) AS $$
BEGIN
    RETURN QUERY SELECT * FROM users;
END;
$$ LANGUAGE plpgsql;
