CREATE TABLE Items( item_id integer PRIMARY KEY autoincrement, name varchar(255) NOT NULL,dt date NOT NULL default (date('now', 'localtime')),tm time NOT NULL default (time('now', 'localtime')),UNIQUE (name));
CREATE TABLE outgoing_stocks(transaction_id INTEGER PRIMARY KEY autoincrement,transaction_type VARCHAR,item_id INTEGER NOT NULL,quantity INTEGER NOT NULL,price INTEGER NOT NULL,reason VARCHAR,dt date  NOT NULL default (date('now', 'localtime')),tm time  NOT NULL default (time('now', 'localtime')),FOREIGN KEY (item_id) REFERENCES Items(item_id));
CREATE TABLE incoming_stocks(transaction_id integer PRIMARY KEY autoincrement,item_id integer NOT NULL,quantity integer NOT NULL,price integer NOT NULL,dt date  NOT NULL default (date('now', 'localtime')),tm time  NOT NULL default (time('now', 'localtime')),FOREIGN KEY (item_id) REFERENCES Items(item_id));
CREATE VIEW outgoing_stocks_view AS SELECT stocks.item_id as item_id, name, SUM(quantity) as sum, SUM(price) as cost, stocks.dt as dt FROM outgoing_stocks as stocks JOIN Items as items ON stocks.item_id = items.item_id group by name, stocks.item_id, stocks.dt order by dt DESC 
CREATE VIEW incoming_stocks_view AS SELECT stocks.item_id AS item_id, name, SUM(quantity) AS sum, SUM(price) AS cost, stocks.dt AS dt FROM incoming_stocks AS stocks JOIN Items AS items ON stocks.item_id = items.item_id GROUP BY name, stocks.item_id, stocks.dt ORDER BY dt DESC;
CREATE VIEW total_outgoing_stocks_view as SELECT item_id, name, SUM(sum) as quantity, SUM(cost) as price from outgoing_stocks_view group by item_id
CREATE VIEW total_incoming_stocks_view AS SELECT item_id, name, SUM(sum) AS quantity, SUM(cost) AS price FROM incoming_stocks_view GROUP BY item_id 
CREATE VIEW current_stocks as SELECT incoming.item_id, incoming.name, SUM(incoming.quantity) - SUM(outgoing.quantity) as cur_stocks from total_incoming_stocks_view as incoming join total_outgoing_stocks_view as outgoing on incoming.item_id = outgoing.item_id group by incoming.item_id union SELECT item_id, name, quantity from total_incoming_stocks_view where item_id NOT in(SELECT item_id from total_outgoing_stocks_view) 
create view transaction_history as SELECT name, 'incoming' as type, sum as quantity, cost as price, dt from incoming_stocks_view where dt = date('now') union SELECT name, 'outgoing' as type, sum as quantity, cost as price, dt from outgoing_stocks_view order by name 
INSERT INTO ITEMS(name,dt,tm) VALUES('cashew0_-','2015-05-11', '18-12-48');
INSERT INTO ITEMS(name,dt,tm) VALUES('cashew1_-','2015-05-11', '18-12-48');
INSERT INTO ITEMS(name,dt,tm) VALUES('cashew2_-','2015-05-11', '18-12-48');
INSERT INTO ITEMS(name,dt,tm) VALUES('cashew3_-','2015-05-11', '18-12-48');
INSERT INTO ITEMS(name,dt,tm) VALUES('cashew4_-','2015-05-11', '18-12-48');
INSERT INTO ITEMS(name,dt,tm) VALUES('cashew5_-','2015-05-11', '18-12-48');
INSERT INTO ITEMS(name,dt,tm) VALUES('cashew6_-','2015-05-11', '18-12-48');
INSERT INTO ITEMS(name,dt,tm) VALUES('cashew7_-','2015-05-11', '18-12-48');
INSERT INTO ITEMS(name,dt,tm) VALUES('cashew8_-','2015-05-11', '18-12-48');
INSERT INTO ITEMS(name,dt,tm) VALUES('cashew9_-','2015-05-11', '18-12-48');
INSERT INTO incoming_stocks (item_id, quantity, price, dt, tm) values(1, 450, 500, '2015-05-11', '18-12-48');
INSERT INTO incoming_stocks (item_id, quantity, price, dt, tm) values(1, 1, 1053, '2015-05-11', '18-12-48');
INSERT INTO incoming_stocks (item_id, quantity, price, dt, tm) values(1, 250000, 75980, '2015-05-11', '18-12-48');
INSERT INTO incoming_stocks (item_id, quantity, price, dt, tm) values(2, 250000, 90000, '2015-05-11', '18-12-48');
INSERT INTO incoming_stocks (item_id, quantity, price, dt, tm) values(3, 250, 300, '2015-05-11', '18-12-48');
INSERT INTO incoming_stocks (item_id, quantity, price, dt, tm) values(3, 119876, 87890, '2015-05-11', '18-12-48');
INSERT INTO incoming_stocks (item_id, quantity, price, dt, tm) values(2, 250, 330, '2014-01-11', '18-12-48');
INSERT INTO incoming_stocks (item_id, quantity, price, dt, tm) values(3, 765, 345, '2015-03-07', '18-12-50');
INSERT INTO outgoing_stocks (transaction_type, item_id, quantity, price, reason, dt, tm) values('Hotel', 1, 4312, 100, 'Shanti Sagar', '2015-05-11', '18-12-50'); 
INSERT INTO outgoing_stocks (transaction_type, item_id, quantity, price, reason, dt, tm) values('LocalSale', 3, 1500, 100, 'Consumer', '2015-05-11', '18-12-50'); 
INSERT INTO outgoing_stocks (transaction_type, item_id, quantity, price, reason, dt, tm) values('Distributor', 2, 4750, 100, 'To Kolar', '2015-05-11', '18-12-50'); 
INSERT INTO incoming_stocks (item_id, quantity, price, dt, tm) values(2, 391, 800, '2015-03-01', '18-12-50');
INSERT INTO incoming_stocks (item_id, quantity, price, dt, tm) values(1, 250, 170, '2014-07-11', '18-12-50');
