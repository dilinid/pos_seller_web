import type { Review } from '../types/marketplace.type';

export const REVIEWS: Review[] = [
  // p1 - Organic Bananas
  { id: 'r1', productId: 'p1', userName: 'Sarah M.', rating: 5, title: 'Perfectly ripe', comment: 'These bananas arrived perfectly ripe. Sweet and delicious. Will order again!', date: '2 days ago' },
  { id: 'r2', productId: 'p1', userName: 'John D.', rating: 4, title: 'Great quality', comment: 'Good quality organic bananas. A bit pricey but worth it for organic.', date: '1 week ago' },
  { id: 'r3', productId: 'p1', userName: 'Lisa K.', rating: 5, title: 'Best bananas on here', comment: 'I have ordered these multiple times. Always fresh and sweet. Highly recommend!', date: '2 weeks ago' },
  { id: 'r4', productId: 'p1', userName: 'Mike R.', rating: 4, title: 'Fresh bunch', comment: 'Came in fresh. Good size bunch with 6 bananas.', date: '3 weeks ago' },

  // p5 - Milk
  { id: 'r5', productId: 'p5', userName: 'Emily W.', rating: 5, title: 'Creamy and delicious', comment: 'This milk is amazing. You can really taste the difference with grass-fed. So creamy!', date: '3 days ago' },
  { id: 'r6', productId: 'p5', userName: 'Tom H.', rating: 4, title: 'Great milk', comment: 'Good quality whole milk. My kids love it. Fresh and creamy.', date: '1 week ago' },
  { id: 'r7', productId: 'p5', userName: 'Anna P.', rating: 5, title: 'Worth every penny', comment: 'Once you try real grass-fed milk, you cannot go back. This is the best.', date: '2 weeks ago' },

  // p12 - Sourdough
  { id: 'r8', productId: 'p12', userName: 'Chef Marco', rating: 5, title: 'Artisanal perfection', comment: 'As a professional baker, I am impressed. Perfect crust, amazing crumb structure.', date: '1 day ago' },
  { id: 'r9', productId: 'p12', userName: 'Julia F.', rating: 5, title: 'Best sourdough in town', comment: 'The tangy flavor is perfect. Toasts beautifully. Already ordered more.', date: '5 days ago' },
  { id: 'r10', productId: 'p12', userName: 'David L.', rating: 4, title: 'Excellent bread', comment: 'Very good sourdough. Fresh and crusty. A bit smaller than expected though.', date: '1 week ago' },
  { id: 'r11', productId: 'p12', userName: 'Rachel G.', rating: 5, title: 'Literally perfect', comment: 'I moved here recently and was searching for good bread. Found it. This is it.', date: '2 weeks ago' },

  // p26 - Toyota Corolla
  { id: 'r12', productId: 'p26', userName: 'Carlos M.', rating: 5, title: 'Excellent condition', comment: 'The car was exactly as described. Low mileage, clean interior, drives perfectly. Smooth transaction.', date: '1 week ago' },
  { id: 'r13', productId: 'p26', userName: 'Nancy P.', rating: 4, title: 'Great first car', comment: 'Bought this for my daughter. Reliable, fuel efficient, and in great shape. Very happy.', date: '3 weeks ago' },

  // p18 - Studio Apartment
  { id: 'r14', productId: 'p18', userName: 'Alex T.', rating: 5, title: 'Perfect location', comment: 'Love this studio. Walking distance to everything. Modern finishes and great views.', date: '1 month ago' },
  { id: 'r15', productId: 'p18', userName: 'Sofia R.', rating: 4, title: 'Great for city living', comment: 'Compact but well-designed. The location makes up for the size. Very happy tenant.', date: '2 months ago' },

  // p9 - Cold Brew
  { id: 'r16', productId: 'p9', userName: 'Coffee Lover99', rating: 5, title: 'Best cold brew ever', comment: 'Smooth, not bitter, perfect concentration. I mix 1:1 with water. Morning essential!', date: '4 days ago' },
  { id: 'r17', productId: 'p9', userName: 'Priya S.', rating: 4, title: 'Rich flavor', comment: 'Very smooth and rich. A bit expensive but the quality justifies the price.', date: '1 week ago' },
  { id: 'r18', productId: 'p9', userName: 'James B.', rating: 5, title: 'Game changer', comment: 'No more coffee shop runs. This concentrate is incredible. Saves me so much money.', date: '2 weeks ago' },
  { id: 'r19', productId: 'p9', userName: 'Maria G.', rating: 4, title: 'Really good', comment: 'Great flavor, easy to make. Wish it came in a larger size bottle.', date: '3 weeks ago' },

  // p27 - Honda CR-V
  { id: 'r20', productId: 'p27', userName: 'FamilyMan2023', rating: 5, title: 'Perfect family SUV', comment: 'Spacious, comfortable, and safe. The AWD handles great in bad weather. Highly recommend.', date: '2 weeks ago' },
  { id: 'r21', productId: 'p27', userName: 'Jennifer K.', rating: 4, title: 'Great SUV', comment: 'Very clean vehicle. Leather seats are in excellent condition. Honda reliability at its best.', date: '1 month ago' },

  // p21 - Family Home
  { id: 'r22', productId: 'p21', userName: 'HomeBuyer2024', rating: 5, title: 'Dream home', comment: 'Fell in love the moment I walked in. The backyard garden is beautiful. Great neighborhood for kids.', date: '2 months ago' },
  { id: 'r23', productId: 'p21', userName: 'Robert C.', rating: 4, title: 'Solid family home', comment: 'Good size, well-maintained. The kitchen renovation is top notch. Good value for the area.', date: '3 months ago' },

  // p33 - Ford Transit
  { id: 'r24', productId: 'p33', userName: 'DeliveryPro', rating: 5, title: 'Workhorse van', comment: 'I use this for my delivery business. Plenty of space, drives well, very reliable.', date: '1 week ago' },

  // p31 - Mountain Bike
  { id: 'r25', productId: 'p31', userName: 'TrailRider99', rating: 4, title: 'Great trail bike', comment: 'Handles well on rough terrain. Suspension is smooth. A bit heavy but solid build.', date: '2 weeks ago' },
  { id: 'r26', productId: 'p31', userName: 'Emma S.', rating: 5, title: 'Love this bike', comment: 'Took it on blue trails right away. Performed amazingly. Great value for the price.', date: '3 weeks ago' },

  // p22 - Villa
  { id: 'r27', productId: 'p22', userName: 'LuxurySeeker', rating: 5, title: 'Absolutely stunning', comment: 'The villa exceeded expectations. The pool and garden are incredible. A true Mediterranean paradise.', date: '1 month ago' },

  // p6 - Eggs
  { id: 'r28', productId: 'p6', userName: 'BakerJane', rating: 5, title: 'Farm fresh eggs', comment: 'The yolks are so orange and rich. Makes a huge difference in baking. Will keep ordering.', date: '5 days ago' },
  { id: 'r29', productId: 'p6', userName: 'Kevin L.', rating: 4, title: 'Great eggs', comment: 'Fresh and tasty. You can taste the difference from store-bought. Good size too.', date: '1 week ago' },

  // p34 - Hilux
  { id: 'r30', productId: 'p34', userName: 'OffRoader2023', rating: 5, title: 'Unstoppable truck', comment: 'The Hilux is a beast. Took it off-roading and it handled everything. Diesel engine is bulletproof.', date: '2 weeks ago' },
  { id: 'r31', productId: 'p34', userName: 'BuilderMike', rating: 4, title: 'Perfect work truck', comment: 'Canopy is great for tools. Tows my trailer easily. Reliable as expected from Toyota.', date: '1 month ago' },
];
