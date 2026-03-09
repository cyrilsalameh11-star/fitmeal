import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const COUNTRIES = [
  { id: 'France', flag: '🇫🇷', label: 'France' },
  { id: 'Spain', flag: '🇪🇸', label: 'Spain' },
  { id: 'Lebanon', flag: '🇱🇧', label: 'Lebanon' },
  { id: 'USA', flag: '🇺🇸', label: 'USA' },
];

const BRANDS = {
  France: [
    {
      name: "McDonald's France", emoji: '🍔', category: 'Fast Food', color: 'from-yellow-400 to-red-500',
      items: [
        { name: 'Big Mac', cal: 508, protein: 27, carbs: 43, fat: 25 },
        { name: 'McWrap Poulet Croustillant', cal: 498, protein: 31, carbs: 44, fat: 21 },
        { name: 'Salade Caesar Poulet', cal: 405, protein: 27, carbs: 20, fat: 24 },
        { name: 'Filet-O-Fish', cal: 327, protein: 15, carbs: 35, fat: 14 },
        { name: 'Royal Cheese', cal: 518, protein: 29, carbs: 40, fat: 28 },
        { name: 'Double Cheeseburger', cal: 440, protein: 29, carbs: 34, fat: 22 },
        { name: 'Chicken McNuggets x9', cal: 420, protein: 25, carbs: 27, fat: 24 },
      ],
    },
    {
      name: 'Burger King France', emoji: '👑', category: 'Fast Food', color: 'from-red-500 to-orange-400',
      items: [
        { name: 'Whopper', cal: 629, protein: 28, carbs: 49, fat: 35 },
        { name: 'Steakhouse Burger', cal: 829, protein: 40, carbs: 56, fat: 50 },
        { name: 'Cheddar Lover Burger', cal: 640, protein: 30, carbs: 42, fat: 38 },
        { name: 'Chicken Louisiane', cal: 846, protein: 42, carbs: 62, fat: 46 },
        { name: 'Big King XXL', cal: 750, protein: 38, carbs: 48, fat: 44 },
      ],
    },
    {
      name: 'KFC France', emoji: '🍗', category: 'Fast Food', color: 'from-red-700 to-red-400',
      items: [
        { name: 'Boxmaster', cal: 657, protein: 36, carbs: 56, fat: 33 },
        { name: 'Tenders x5', cal: 464, protein: 37, carbs: 32, fat: 21 },
        { name: 'Twister Poulet', cal: 498, protein: 26, carbs: 50, fat: 21 },
        { name: 'Bucket Original 6pc', cal: 720, protein: 50, carbs: 38, fat: 38 },
        { name: 'Crunch Burger', cal: 540, protein: 28, carbs: 46, fat: 26 },
      ],
    },
    {
      name: 'Quick', emoji: '⚡', category: 'Fast Food', color: 'from-orange-600 to-yellow-400',
      items: [
        { name: 'Giant Cheese', cal: 680, protein: 35, carbs: 52, fat: 38 },
        { name: 'Big Bacon', cal: 720, protein: 40, carbs: 50, fat: 42 },
        { name: 'Chicken Quick', cal: 580, protein: 30, carbs: 48, fat: 28 },
        { name: 'Giant Poulet Fromage', cal: 650, protein: 34, carbs: 50, fat: 34 },
        { name: 'Twistos Cheese', cal: 490, protein: 22, carbs: 44, fat: 26 },
      ],
    },
    {
      name: 'O\'Tacos', emoji: '🌮', category: 'Fast Food', color: 'from-green-600 to-lime-400',
      items: [
        { name: 'O\'Tacos XL Poulet-Fromage', cal: 920, protein: 48, carbs: 85, fat: 42 },
        { name: 'O\'Tacos M Bœuf', cal: 700, protein: 36, carbs: 65, fat: 30 },
        { name: 'O\'Tacos L Mixte', cal: 810, protein: 42, carbs: 74, fat: 36 },
        { name: 'Samoussa x3', cal: 380, protein: 16, carbs: 40, fat: 18 },
        { name: 'Cheese Fries', cal: 450, protein: 12, carbs: 52, fat: 22 },
      ],
    },
    {
      name: 'Chicken Street', emoji: '🐔', category: 'Fast Food', color: 'from-amber-600 to-orange-400',
      items: [
        { name: 'Street Burger Poulet', cal: 620, protein: 38, carbs: 46, fat: 28 },
        { name: 'Chicken Strips x4', cal: 480, protein: 34, carbs: 36, fat: 20 },
        { name: 'Bowl Poulet Riz', cal: 550, protein: 42, carbs: 52, fat: 18 },
        { name: 'Wrap Croustillant', cal: 510, protein: 30, carbs: 48, fat: 20 },
      ],
    },
    {
      name: 'Peppe Chicken', emoji: '🌶️', category: 'Fast Food', color: 'from-red-600 to-amber-500',
      items: [
        { name: 'Peppe Burger Spicy', cal: 640, protein: 36, carbs: 50, fat: 30 },
        { name: 'Chicken Thighs x3', cal: 520, protein: 40, carbs: 28, fat: 26 },
        { name: 'Peppe Sandwich', cal: 570, protein: 32, carbs: 44, fat: 24 },
        { name: 'Loaded Fries', cal: 480, protein: 14, carbs: 58, fat: 22 },
      ],
    },
    {
      name: 'Subway France', emoji: '🥖', category: 'Fast Food', color: 'from-green-500 to-yellow-400',
      items: [
        { name: 'Poulet Teriyaki 30cm', cal: 580, protein: 42, carbs: 76, fat: 10 },
        { name: 'Steak & Cheese 15cm', cal: 303, protein: 21, carbs: 38, fat: 8 },
        { name: 'Sub Dinde & Jambon 15cm', cal: 297, protein: 22, carbs: 38, fat: 5 },
        { name: 'Veggie Delite 15cm', cal: 200, protein: 8, carbs: 38, fat: 2 },
        { name: 'Tuna 15cm', cal: 360, protein: 20, carbs: 38, fat: 14 },
      ],
    },
    {
      name: 'Prêt à Manger', emoji: '🥗', category: 'Restaurant', color: 'from-emerald-600 to-teal-400',
      items: [
        { name: 'Bowl Protéiné Quinoa', cal: 490, protein: 38, carbs: 42, fat: 14 },
        { name: 'Sandwich Poulet Avocat', cal: 430, protein: 28, carbs: 36, fat: 18 },
        { name: 'Bowl Saumon Riz Noir', cal: 510, protein: 32, carbs: 50, fat: 20 },
        { name: 'Soupe Potiron', cal: 210, protein: 5, carbs: 28, fat: 9 },
        { name: 'Pot Skyr Fruits Rouges', cal: 140, protein: 12, carbs: 18, fat: 2 },
      ],
    },
    {
      name: 'Boulangerie Paul', emoji: '🥐', category: 'Bakery', color: 'from-amber-700 to-amber-400',
      items: [
        { name: 'Croissant au Beurre', cal: 280, protein: 5, carbs: 30, fat: 16 },
        { name: 'Pain au Chocolat', cal: 320, protein: 6, carbs: 34, fat: 18 },
        { name: 'Sandwich Jambon Beurre', cal: 420, protein: 18, carbs: 42, fat: 18 },
        { name: 'Quiche Lorraine', cal: 480, protein: 16, carbs: 32, fat: 32 },
        { name: 'Salade Composée', cal: 380, protein: 22, carbs: 28, fat: 20 },
        { name: 'Tarte aux Pommes', cal: 290, protein: 4, carbs: 42, fat: 12 },
      ],
    },
    {
      name: 'Carrefour', emoji: '🛒', category: 'Supermarket', color: 'from-blue-500 to-blue-700',
      items: [
        { name: 'Escalope de Poulet (100g)', cal: 165, protein: 31, carbs: 1, fat: 4 },
        { name: 'Filet de Saumon (150g)', cal: 208, protein: 22, carbs: 0, fat: 13 },
        { name: 'Skyr Nature 0% (150g)', cal: 68, protein: 11, carbs: 5, fat: 0 },
        { name: 'Lasagnes Bolognaise', cal: 430, protein: 24, carbs: 36, fat: 22 },
        { name: 'Salade Poulet Crudités', cal: 350, protein: 28, carbs: 18, fat: 18 },
      ],
    },
    {
      name: 'Auchan', emoji: '🏬', category: 'Supermarket', color: 'from-red-500 to-red-700',
      items: [
        { name: 'Poulet Rôti (1/2)', cal: 380, protein: 45, carbs: 0, fat: 22 },
        { name: 'Pizza 4 Fromages', cal: 720, protein: 28, carbs: 82, fat: 30 },
        { name: 'Bowl Quinoa Légumes', cal: 340, protein: 14, carbs: 48, fat: 12 },
        { name: 'Yaourt Grec (150g)', cal: 120, protein: 10, carbs: 6, fat: 6 },
        { name: 'Saumon Fumé (100g)', cal: 160, protein: 20, carbs: 0, fat: 9 },
      ],
    },
  ],
  Spain: [
    {
      name: 'VIPS', emoji: '🥩', category: 'Restaurant', color: 'from-orange-500 to-red-400',
      items: [
        { name: 'BBQ Ribs (Half Rack)', cal: 550, protein: 52, carbs: 2, fat: 37 },
        { name: 'Pechugas con Cottage', cal: 298, protein: 43, carbs: 14, fat: 8 },
        { name: 'Ensalada Cesar', cal: 460, protein: 25, carbs: 34, fat: 25 },
        { name: 'Burger Pampera', cal: 850, protein: 40, carbs: 52, fat: 55 },
        { name: 'Club Sandwich VIPS', cal: 770, protein: 25, carbs: 62, fat: 48 },
        { name: 'Tortilla de Claras', cal: 172, protein: 16, carbs: 19, fat: 4 },
      ],
    },
    {
      name: '100 Montaditos', emoji: '🥖', category: 'Fast Food', color: 'from-amber-500 to-amber-700',
      items: [
        { name: 'Montadito Pollo Kebab', cal: 240, protein: 12, carbs: 28, fat: 9 },
        { name: 'Montadito Club', cal: 190, protein: 9, carbs: 22, fat: 8 },
        { name: 'Montadito Lacón y Queso', cal: 160, protein: 7, carbs: 20, fat: 6 },
        { name: 'Mini Perrito con Cebolla', cal: 210, protein: 8, carbs: 22, fat: 10 },
        { name: 'Montadito Jamón Serrano', cal: 175, protein: 10, carbs: 20, fat: 6 },
      ],
    },
    {
      name: 'Goiko', emoji: '🍔', category: 'Restaurant', color: 'from-stone-900 to-stone-600',
      items: [
        { name: 'Kevin Bacon Burger', cal: 1100, protein: 55, carbs: 45, fat: 75 },
        { name: 'La Vegana', cal: 780, protein: 28, carbs: 62, fat: 48 },
        { name: 'The Don Burger', cal: 980, protein: 50, carbs: 48, fat: 62 },
        { name: 'Goiko Fries (Loaded)', cal: 620, protein: 18, carbs: 68, fat: 32 },
      ],
    },
    {
      name: "McDonald's Spain", emoji: '🍔', category: 'Fast Food', color: 'from-yellow-400 to-red-500',
      items: [
        { name: 'McExtreme BBQ', cal: 730, protein: 38, carbs: 58, fat: 38 },
        { name: 'McPollo', cal: 480, protein: 26, carbs: 44, fat: 20 },
        { name: 'Big Mac', cal: 508, protein: 27, carbs: 43, fat: 25 },
        { name: 'Ensalada Pollo a la Plancha', cal: 320, protein: 30, carbs: 18, fat: 14 },
        { name: 'McFlurry Oreo', cal: 340, protein: 8, carbs: 52, fat: 12 },
      ],
    },
    {
      name: 'KFC Spain', emoji: '🍗', category: 'Fast Food', color: 'from-red-700 to-red-400',
      items: [
        { name: 'Twister Original', cal: 510, protein: 26, carbs: 52, fat: 22 },
        { name: 'Bucket Original 6pc', cal: 720, protein: 50, carbs: 38, fat: 38 },
        { name: 'Tenders x3', cal: 285, protein: 22, carbs: 20, fat: 12 },
        { name: 'Zinger Burger', cal: 560, protein: 30, carbs: 48, fat: 24 },
        { name: 'Colonel\'s Box', cal: 860, protein: 44, carbs: 72, fat: 40 },
      ],
    },
    {
      name: 'Telepizza', emoji: '🍕', category: 'Fast Food', color: 'from-red-600 to-orange-500',
      items: [
        { name: 'Pizza Barbacoa (Mediana, 2 trozos)', cal: 520, protein: 26, carbs: 58, fat: 20 },
        { name: 'Pizza 4 Quesos (Mediana, 2 trozos)', cal: 560, protein: 24, carbs: 56, fat: 24 },
        { name: 'Pizza Pollo BBQ (Mediana, 2 trozos)', cal: 490, protein: 28, carbs: 54, fat: 18 },
        { name: 'Alitas de Pollo x8', cal: 540, protein: 44, carbs: 12, fat: 34 },
        { name: 'Focaccia de Ajo', cal: 280, protein: 8, carbs: 38, fat: 12 },
      ],
    },
    {
      name: 'Mercadona', emoji: '🏪', category: 'Supermarket', color: 'from-green-600 to-emerald-400',
      items: [
        { name: 'Pechuga de Pollo (100g)', cal: 110, protein: 24, carbs: 0, fat: 2 },
        { name: 'Salmón Atlántico (150g)', cal: 208, protein: 20, carbs: 0, fat: 14 },
        { name: 'Yogur Proteico 0%', cal: 65, protein: 10, carbs: 5, fat: 0 },
        { name: 'Lentejas con Verduras', cal: 380, protein: 22, carbs: 48, fat: 12 },
        { name: 'Paella de Marisco', cal: 420, protein: 18, carbs: 65, fat: 12 },
        { name: 'Tortilla de Patata', cal: 510, protein: 14, carbs: 32, fat: 36 },
      ],
    },
    {
      name: 'Carrefour Spain', emoji: '🛒', category: 'Supermarket', color: 'from-blue-500 to-blue-700',
      items: [
        { name: 'Pollo a la Plancha Ready-Meal', cal: 280, protein: 38, carbs: 8, fat: 11 },
        { name: 'Ensalada César Preparada', cal: 360, protein: 22, carbs: 20, fat: 22 },
        { name: 'Filete de Merluza (150g)', cal: 130, protein: 26, carbs: 0, fat: 2 },
        { name: 'Skyr Natural (200g)', cal: 120, protein: 20, carbs: 8, fat: 0 },
      ],
    },
    {
      name: 'Alcampo', emoji: '🏬', category: 'Supermarket', color: 'from-teal-600 to-cyan-400',
      items: [
        { name: 'Pechugas de Pavo (100g)', cal: 105, protein: 22, carbs: 0, fat: 2 },
        { name: 'Arroz con Pollo Ready', cal: 400, protein: 28, carbs: 50, fat: 10 },
        { name: 'Sopa de Verduras', cal: 180, protein: 6, carbs: 28, fat: 5 },
        { name: 'Hummus Clásico (200g)', cal: 320, protein: 12, carbs: 28, fat: 18 },
      ],
    },
  ],
  Lebanon: [
    {
      name: 'Malak al Taouk', emoji: '🐓', category: 'Restaurant', color: 'from-amber-600 to-orange-500',
      items: [
        { name: 'Classic Tawouk Sandwich', cal: 650, protein: 45, carbs: 55, fat: 28 },
        { name: 'Franji Tawouk (Baguette)', cal: 580, protein: 42, carbs: 50, fat: 22 },
        { name: 'Tawouk Platter', cal: 950, protein: 55, carbs: 70, fat: 45 },
        { name: 'Malak Burger', cal: 850, protein: 35, carbs: 65, fat: 50 },
        { name: 'Tawouk Bowl (Rice & Garlic)', cal: 780, protein: 48, carbs: 68, fat: 30 },
        { name: 'Mini Tawouk Skewers x3', cal: 380, protein: 34, carbs: 10, fat: 22 },
      ],
    },
    {
      name: 'Roadster Diner', emoji: '🏁', category: 'Restaurant', color: 'from-red-800 to-stone-700',
      items: [
        { name: 'Classic Roadster Burger', cal: 880, protein: 45, carbs: 62, fat: 52 },
        { name: 'BBQ Chicken Wrap', cal: 660, protein: 40, carbs: 54, fat: 28 },
        { name: 'Shawarma Plate', cal: 750, protein: 48, carbs: 60, fat: 30 },
        { name: 'Crispy Chicken Salad', cal: 480, protein: 32, carbs: 28, fat: 26 },
        { name: 'Halloumi Burger', cal: 720, protein: 32, carbs: 58, fat: 38 },
        { name: 'Brownie Sundae', cal: 640, protein: 8, carbs: 80, fat: 32 },
      ],
    },
    {
      name: "McDonald's Lebanon", emoji: '🍔', category: 'Fast Food', color: 'from-yellow-400 to-red-500',
      items: [
        { name: 'Big Mac', cal: 508, protein: 27, carbs: 43, fat: 25 },
        { name: 'McArabia Chicken', cal: 620, protein: 38, carbs: 56, fat: 26 },
        { name: 'McFalafel', cal: 480, protein: 18, carbs: 58, fat: 20 },
        { name: 'Chicken McNuggets x6', cal: 280, protein: 17, carbs: 18, fat: 16 },
        { name: 'McFlurry Oreo', cal: 340, protein: 8, carbs: 52, fat: 12 },
      ],
    },
    {
      name: 'Zaatar w Zeit', emoji: '🫓', category: 'Restaurant', color: 'from-green-700 to-lime-500',
      items: [
        { name: 'Man\'oushé Zaatar', cal: 420, protein: 10, carbs: 62, fat: 16 },
        { name: 'Man\'oushé Cheese', cal: 480, protein: 18, carbs: 60, fat: 20 },
        { name: 'Man\'oushé Zaatar & Cheese', cal: 520, protein: 16, carbs: 65, fat: 22 },
        { name: 'Chicken & Garlic Wrap', cal: 580, protein: 38, carbs: 52, fat: 22 },
        { name: 'Spinach & Cheese Fatayer', cal: 340, protein: 12, carbs: 44, fat: 14 },
        { name: 'Grilled Chicken Platter', cal: 680, protein: 50, carbs: 55, fat: 24 },
      ],
    },
    {
      name: 'Bartartine', emoji: '🥪', category: 'Restaurant', color: 'from-stone-600 to-amber-600',
      items: [
        { name: 'Chicken Avocado Sandwich', cal: 560, protein: 36, carbs: 44, fat: 24 },
        { name: 'Smoked Salmon Bagel', cal: 490, protein: 28, carbs: 46, fat: 20 },
        { name: 'Tuna Melt', cal: 520, protein: 30, carbs: 42, fat: 24 },
        { name: 'Caesar Salad (Chicken)', cal: 420, protein: 32, carbs: 18, fat: 24 },
        { name: 'Granola Bowl with Yogurt', cal: 380, protein: 14, carbs: 52, fat: 12 },
      ],
    },
    {
      name: 'Crepaway', emoji: '🥞', category: 'Restaurant', color: 'from-purple-600 to-pink-500',
      items: [
        { name: 'Beatrice Crepe (Chicken)', cal: 540, protein: 32, carbs: 45, fat: 26 },
        { name: 'Chicken Sub', cal: 510, protein: 36, carbs: 48, fat: 18 },
        { name: 'Caesar Salad', cal: 420, protein: 28, carbs: 18, fat: 24 },
        { name: 'Josephine Crepe (Ham)', cal: 480, protein: 24, carbs: 42, fat: 22 },
        { name: 'Magali Crepe (Choc)', cal: 450, protein: 6, carbs: 58, fat: 22 },
        { name: 'Martine Crepe (Banana)', cal: 520, protein: 8, carbs: 62, fat: 26 },
      ],
    },
    {
      name: 'Abdallah', emoji: '🧆', category: 'Restaurant', color: 'from-stone-700 to-stone-500',
      items: [
        { name: 'Shish Taouk Platter', cal: 550, protein: 42, carbs: 50, fat: 22 },
        { name: 'Kofta Platter', cal: 580, protein: 38, carbs: 35, fat: 32 },
        { name: 'Hummus with Sautéed Meat', cal: 450, protein: 22, carbs: 28, fat: 28 },
        { name: 'Fatteh (Chickpeas, Yogurt)', cal: 420, protein: 18, carbs: 45, fat: 20 },
        { name: 'Kibbeh (per piece)', cal: 160, protein: 7, carbs: 14, fat: 9 },
        { name: 'Assorted Baklava', cal: 240, protein: 3, carbs: 32, fat: 12 },
        { name: 'Nammoura (per piece)', cal: 180, protein: 3, carbs: 30, fat: 6 },
      ],
    },
    {
      name: 'Dip n Dip', emoji: '🍫', category: 'Desserts', color: 'from-amber-900 to-stone-700',
      items: [
        { name: 'Chocolate Fondue (2 pax)', cal: 820, protein: 14, carbs: 92, fat: 46 },
        { name: 'Belgian Waffle with Nutella', cal: 560, protein: 8, carbs: 72, fat: 28 },
        { name: 'Strawberry Fondue', cal: 680, protein: 10, carbs: 82, fat: 34 },
        { name: 'Crepe with Dark Chocolate', cal: 420, protein: 6, carbs: 56, fat: 20 },
        { name: 'Cookie Dough Sundae', cal: 640, protein: 9, carbs: 80, fat: 34 },
        { name: 'Hot Chocolate Brownie', cal: 480, protein: 7, carbs: 62, fat: 24 },
      ],
    },
    {
      name: 'Pinkberry', emoji: '🍦', category: 'Frozen Yogurt', color: 'from-pink-500 to-fuchsia-400',
      items: [
        { name: 'Original Frozen Yogurt (Small)', cal: 100, protein: 3, carbs: 22, fat: 0 },
        { name: 'Mango Frozen Yogurt (Medium)', cal: 160, protein: 4, carbs: 36, fat: 0 },
        { name: 'Strawberry FroYo (Large)', cal: 210, protein: 5, carbs: 46, fat: 0 },
        { name: 'FroYo with Granola & Honey', cal: 320, protein: 8, carbs: 62, fat: 4 },
        { name: 'Berry Parfait (FroYo + Berries)', cal: 240, protein: 6, carbs: 50, fat: 1 },
      ],
    },
    {
      name: 'Spinneys', emoji: '🛒', category: 'Supermarket', color: 'from-teal-600 to-cyan-400',
      items: [
        { name: 'Chicken Breast (100g)', cal: 120, protein: 26, carbs: 0, fat: 2 },
        { name: 'Greek Yoghurt (150g)', cal: 100, protein: 9, carbs: 4, fat: 5 },
        { name: 'Labneh (100g)', cal: 170, protein: 8, carbs: 4, fat: 14 },
        { name: 'Grilled Chicken Ready Meal', cal: 330, protein: 52, carbs: 0, fat: 12 },
        { name: 'Quinoa & Pomegranate Salad', cal: 350, protein: 12, carbs: 45, fat: 14 },
        { name: 'Beef Shawarma Ready Meal', cal: 520, protein: 38, carbs: 42, fat: 22 },
      ],
    },
  ],
  USA: [
    {
      name: 'Chipotle', emoji: '🌯', category: 'Restaurant', color: 'from-red-700 to-orange-500',
      items: [
        { name: 'Chicken Burrito Bowl', cal: 660, protein: 52, carbs: 70, fat: 18 },
        { name: 'Steak Burrito', cal: 790, protein: 42, carbs: 80, fat: 30 },
        { name: 'Veggie Bowl', cal: 490, protein: 18, carbs: 62, fat: 18 },
        { name: 'Carnitas Tacos (3)', cal: 520, protein: 36, carbs: 48, fat: 20 },
        { name: 'Barbacoa Bowl', cal: 620, protein: 44, carbs: 58, fat: 22 },
      ],
    },
    {
      name: 'Cava', emoji: '🥙', category: 'Restaurant', color: 'from-sky-600 to-blue-400',
      items: [
        { name: 'Grilled Chicken Bowl', cal: 570, protein: 48, carbs: 56, fat: 18 },
        { name: 'Falafel Bowl', cal: 620, protein: 22, carbs: 70, fat: 28 },
        { name: 'Braised Lamb Pita', cal: 680, protein: 38, carbs: 62, fat: 28 },
        { name: 'Salmon Avocado Bowl', cal: 640, protein: 40, carbs: 52, fat: 28 },
        { name: 'Roasted Veggies & Hummus Bowl', cal: 480, protein: 16, carbs: 58, fat: 22 },
      ],
    },
    {
      name: 'Five Guys', emoji: '🍟', category: 'Fast Food', color: 'from-red-600 to-red-800',
      items: [
        { name: 'Little Hamburger', cal: 480, protein: 26, carbs: 40, fat: 22 },
        { name: 'Little Cheeseburger', cal: 550, protein: 30, carbs: 40, fat: 28 },
        { name: 'Bacon Cheeseburger', cal: 780, protein: 46, carbs: 40, fat: 48 },
        { name: 'Five Guys Style Fries', cal: 953, protein: 14, carbs: 131, fat: 43 },
        { name: 'Grilled Chicken Sandwich', cal: 490, protein: 38, carbs: 40, fat: 16 },
      ],
    },
    {
      name: "McDonald's USA", emoji: '🍔', category: 'Fast Food', color: 'from-yellow-400 to-red-500',
      items: [
        { name: 'Quarter Pounder w/ Cheese', cal: 520, protein: 30, carbs: 42, fat: 26 },
        { name: 'Big Mac', cal: 550, protein: 25, carbs: 45, fat: 30 },
        { name: 'McDouble', cal: 400, protein: 24, carbs: 35, fat: 20 },
        { name: 'Egg McMuffin', cal: 310, protein: 17, carbs: 30, fat: 13 },
        { name: 'Southwest Grilled Chicken Salad', cal: 350, protein: 37, carbs: 28, fat: 11 },
      ],
    },
    {
      name: 'Chick-fil-A', emoji: '🐔', category: 'Fast Food', color: 'from-red-600 to-red-800',
      items: [
        { name: 'Chicken Sandwich', cal: 440, protein: 28, carbs: 41, fat: 19 },
        { name: 'Grilled Chicken Sandwich', cal: 320, protein: 30, carbs: 36, fat: 6 },
        { name: 'Nuggets x8', cal: 260, protein: 26, carbs: 12, fat: 12 },
        { name: 'Cobb Salad (Grilled)', cal: 500, protein: 42, carbs: 22, fat: 26 },
        { name: 'Spicy Deluxe Sandwich', cal: 550, protein: 36, carbs: 47, fat: 24 },
      ],
    },
    {
      name: 'Sweetgreen', emoji: '🥗', category: 'Restaurant', color: 'from-green-600 to-lime-400',
      items: [
        { name: 'Harvest Bowl', cal: 705, protein: 36, carbs: 68, fat: 34 },
        { name: 'Protein Plate', cal: 520, protein: 48, carbs: 30, fat: 24 },
        { name: 'Garden Cobb', cal: 475, protein: 35, carbs: 22, fat: 28 },
        { name: 'Chicken Pesto Parm', cal: 625, protein: 40, carbs: 55, fat: 26 },
        { name: 'Shroomami Bowl', cal: 595, protein: 22, carbs: 68, fat: 26 },
      ],
    },
    {
      name: '7-Eleven', emoji: '🏪', category: 'Convenience', color: 'from-green-600 to-red-600',
      items: [
        { name: 'Big Gulp Diet Coke (44oz)', cal: 0, protein: 0, carbs: 0, fat: 0 },
        { name: 'Hot Dog (Standard)', cal: 370, protein: 14, carbs: 30, fat: 22 },
        { name: 'Taquito Chicken', cal: 200, protein: 9, carbs: 22, fat: 8 },
        { name: 'Protein Bar (Quest)', cal: 190, protein: 21, carbs: 21, fat: 7 },
        { name: 'Hard-Boiled Eggs (2)', cal: 140, protein: 12, carbs: 1, fat: 10 },
        { name: 'Turkey & Cheese Sandwich', cal: 420, protein: 22, carbs: 38, fat: 18 },
      ],
    },
    {
      name: "Trader Joe's", emoji: '🌿', category: 'Supermarket', color: 'from-red-700 to-amber-500',
      items: [
        { name: 'Grilled Chicken Strips (3oz)', cal: 90, protein: 18, carbs: 0, fat: 2 },
        { name: 'Mandarin Chicken (Frozen)', cal: 320, protein: 22, carbs: 38, fat: 8 },
        { name: 'High Protein Yogurt (Plain)', cal: 100, protein: 15, carbs: 8, fat: 0 },
        { name: 'Chicken Tikka Masala', cal: 440, protein: 30, carbs: 38, fat: 16 },
        { name: 'Quinoa & Vegetable Bowl', cal: 350, protein: 12, carbs: 52, fat: 10 },
        { name: 'Salmon Fillets (4oz)', cal: 160, protein: 22, carbs: 0, fat: 8 },
      ],
    },
    {
      name: 'Walmart', emoji: '🏬', category: 'Supermarket', color: 'from-blue-600 to-blue-800',
      items: [
        { name: 'Great Value Chicken Breast (4oz)', cal: 110, protein: 26, carbs: 0, fat: 1 },
        { name: 'Rotisserie Chicken (1/2)', cal: 430, protein: 52, carbs: 0, fat: 24 },
        { name: 'Deli Turkey Slices (2oz)', cal: 60, protein: 10, carbs: 2, fat: 1 },
        { name: 'Marketside Salad Kit (Caesar)', cal: 180, protein: 6, carbs: 14, fat: 12 },
        { name: 'Fairlife Chocolate Milk (14oz)', cal: 240, protein: 13, carbs: 36, fat: 6 },
      ],
    },
    {
      name: 'Whole Foods Market', emoji: '🌿', category: 'Supermarket', color: 'from-green-700 to-emerald-500',
      items: [
        { name: 'Organic Chicken Breast (4oz)', cal: 165, protein: 31, carbs: 0, fat: 4 },
        { name: 'Wild Salmon Fillet (6oz)', cal: 240, protein: 34, carbs: 0, fat: 12 },
        { name: 'Greek Yogurt Plain (6oz)', cal: 100, protein: 17, carbs: 6, fat: 1 },
        { name: '365 Protein Bar', cal: 200, protein: 20, carbs: 22, fat: 7 },
        { name: 'Grass-Fed Beef Patty (4oz)', cal: 240, protein: 26, carbs: 0, fat: 16 },
      ],
    },
  ],
};

function MacroPill({ label, value, color }) {
  return (
    <span className={`inline-flex flex-col items-center px-2.5 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-widest ${color}`}>
      <span className="text-[11px] font-black">{value}</span>
      <span className="opacity-70">{label}</span>
    </span>
  );
}

function BrandCard({ brand, reverse }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-60px' }}
      transition={{ duration: 0.5 }}
      className={`grid grid-cols-1 md:grid-cols-2 gap-0 rounded-3xl overflow-hidden border border-stone-100 shadow-sm hover:shadow-xl transition-shadow ${reverse ? 'md:grid-flow-col-dense' : ''}`}
    >
      {/* Brand Identity Panel */}
      <div className={`bg-gradient-to-br ${brand.color} p-8 md:p-10 flex flex-col justify-between min-h-[160px] ${reverse ? 'md:order-2' : ''}`}>
        <div>
          <span className="text-4xl">{brand.emoji}</span>
          <div className="mt-4">
            <p className="text-white/60 text-[10px] font-bold uppercase tracking-widest mb-1">{brand.category}</p>
            <h3 className="text-white font-black text-xl md:text-2xl leading-tight">{brand.name}</h3>
          </div>
        </div>
        <p className="text-white/50 text-xs font-semibold mt-4">{brand.items.length} items available</p>
      </div>

      {/* Menu Items Panel */}
      <div className={`bg-white p-6 md:p-8 space-y-3 ${reverse ? 'md:order-1' : ''}`}>
        {brand.items.map((item, i) => (
          <div key={i} className="border-b border-stone-50 pb-3 last:border-0 last:pb-0">
            <p className="font-bold text-stone-900 text-sm mb-2">{item.name}</p>
            <div className="flex flex-wrap gap-1.5">
              <MacroPill label="kcal" value={item.cal} color="bg-amber-50 text-amber-800" />
              <MacroPill label="prot" value={`${item.protein}g`} color="bg-blue-50 text-blue-800" />
              <MacroPill label="carbs" value={`${item.carbs}g`} color="bg-emerald-50 text-emerald-800" />
              <MacroPill label="fat" value={`${item.fat}g`} color="bg-stone-100 text-stone-700" />
            </div>
          </div>
        ))}
      </div>
    </motion.div>
  );
}

export default function ExplorePage() {
  const [activeCountry, setActiveCountry] = useState('France');
  const brands = BRANDS[activeCountry] || [];

  return (
    <motion.div
      key="explore"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="space-y-10 md:space-y-12"
    >
      {/* Header */}
      <div className="max-w-3xl">
        <p className="text-xs font-bold text-amber-500 uppercase tracking-widest mb-3">Global Database</p>
        <h1 className="text-4xl md:text-5xl lg:text-6xl mb-4 leading-tight">Explore Menus &amp; <br /><span className="italic font-normal text-stone-400">Track Macros.</span></h1>
        <p className="text-base md:text-lg text-stone-500 font-medium">Browse restaurants, fast-food chains, and supermarkets across 4 countries — with full nutritional breakdowns.</p>
      </div>

      {/* Country Tabs — horizontally scrollable on mobile */}
      <div className="flex overflow-x-auto gap-3 pb-2 -mx-2 px-2 scrollbar-hide">
        {COUNTRIES.map(c => (
          <button
            key={c.id}
            onClick={() => setActiveCountry(c.id)}
            className={`flex-shrink-0 flex items-center space-x-2 px-5 py-3 rounded-2xl font-bold text-sm uppercase tracking-widest border transition-all ${
              activeCountry === c.id
                ? 'bg-stone-900 text-white border-stone-900 shadow-lg scale-[1.03]'
                : 'bg-white text-stone-500 border-stone-200 hover:border-amber-200'
            }`}
          >
            <span className="text-xl">{c.flag}</span>
            <span>{c.label}</span>
          </button>
        ))}
      </div>

      {/* Brand count badge */}
      <p className="text-xs text-stone-400 font-medium">
        <span className="font-black text-stone-900">{brands.length}</span> brands available in {activeCountry}
      </p>

      {/* Z-Layout Brand Cards */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeCountry}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="space-y-6"
        >
          {brands.map((brand, idx) => (
            <BrandCard key={brand.name} brand={brand} reverse={idx % 2 === 1} />
          ))}
        </motion.div>
      </AnimatePresence>
    </motion.div>
  );
}
