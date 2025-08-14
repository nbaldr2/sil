import React, { useState, useEffect } from 'react';
import { 
  Plus, 
  Search, 
  Edit, 
  Trash2, 
  Eye, 
  ShoppingCart, 
  Truck, 
  CheckCircle, 
  XCircle,
  Clock,
  Filter,
  Download,
  Calendar,
  Building,
  Package,
  DollarSign
} from 'lucide-react';
import { useAuth } from '../App';
import { stockService } from '../services/integrations';

interface Order {
  id: string;
  orderNumber: string;
  supplierId: string;
  supplier: {
    name: string;
    code: string;
  };
  status: 'DRAFT' | 'PENDING' | 'CONFIRMED' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED';
  orderDate: string;
  expectedDate?: string;
  totalAmount: number;
  notes?: string;
  createdAt: string;
  updatedAt: string;
  orderItems: OrderItem[];
}

interface OrderItem {
  id: string;
  productId: string;
  product: {
    name: string;
    code: string;
  };
  quantity: number;
  unitPrice: number;
  totalPrice: number;
}

interface Supplier {
  id: string;
  name: string;
  code: string;
}

interface Product {
  id: string;
  name: string;
  code: string;
  price: number;
}

export default function OrdersManagement() {
  const { language } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [filteredOrders, setFilteredOrders] = useState<Order[]>([]);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [isLoading, setIsLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingOrder, setEditingOrder] = useState<Order | null>(null);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  const t = {
    fr: {
      title: 'Gestion des Commandes',
      subtitle: 'Gérez vos commandes de stock',
      addOrder: 'Nouvelle Commande',
      editOrder: 'Modifier Commande',
      viewOrder: 'Détails Commande',
      search: 'Rechercher...',
      filter: 'Filtrer par statut',
      all: 'Tous',
      draft: 'Brouillon',
      pending: 'En attente',
      confirmed: 'Confirmée',
      shipped: 'Expédiée',
      delivered: 'Livrée',
      cancelled: 'Annulée',
      orderNumber: 'N° Commande',
      supplier: 'Fournisseur',
      status: 'Statut',
      orderDate: 'Date Commande',
      expectedDate: 'Date Livraison',
      totalAmount: 'Montant Total',
      actions: 'Actions',
      save: 'Enregistrer',
      cancel: 'Annuler',
      delete: 'Supprimer',
      confirmDelete: 'Êtes-vous sûr de vouloir supprimer cette commande ?',
      success: 'Commande enregistrée avec succès',
      error: 'Erreur lors de l\'enregistrement',
      noOrders: 'Aucune commande trouvée',
      totalOrders: 'Total Commandes',
      pendingOrders: 'Commandes En Attente',
      totalValue: 'Valeur Totale'
    },
    en: {
      title: 'Orders Management',
      subtitle: 'Manage your stock orders',
      addOrder: 'New Order',
      editOrder: 'Edit Order',
      viewOrder: 'View Order',
      search: 'Search...',
      filter: 'Filter by status',
      all: 'All',
      draft: 'Draft',
      pending: 'Pending',
      confirmed: 'Confirmed',
      shipped: 'Shipped',
      delivered: 'Delivered',
      cancelled: 'Cancelled',
      orderNumber: 'Order Number',
      supplier: 'Supplier',
      status: 'Status',
      orderDate: 'Order Date',
      expectedDate: 'Expected Date',
      totalAmount: 'Total Amount',
      actions: 'Actions',
      save: 'Save',
      cancel: 'Cancel',
      delete: 'Delete',
      confirmDelete: 'Are you sure you want to delete this order?',
      success: 'Order saved successfully',
      error: 'Error saving order',
      noOrders: 'No orders found',
      totalOrders: 'Total Orders',
      pendingOrders: 'Pending Orders',
      totalValue: 'Total Value'
    }
  }[language];

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    filterOrders();
  }, [orders, searchTerm, statusFilter]);

  const loadData = async () => {
    try {
      setIsLoading(true);
      const [ordersData, suppliersData, productsData] = await Promise.all([
        stockService.getOrders(),
        stockService.getSuppliers(),
        stockService.getProducts()
      ]);
      setOrders(ordersData);
      setSuppliers(suppliersData);
      setProducts(productsData);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const filterOrders = () => {
    let filtered = orders;

    if (searchTerm) {
      filtered = filtered.filter(order =>
        order.orderNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.supplier.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (statusFilter !== 'all') {
      filtered = filtered.filter(order => order.status === statusFilter.toUpperCase());
    }

    setFilteredOrders(filtered);
  };

  const handleSave = async (orderData: Partial<Order>) => {
    try {
      if (editingOrder) {
        await stockService.updateOrder(editingOrder.id, orderData);
      } else {
        await stockService.createOrder(orderData);
      }
      
      await loadData();
      setShowAddModal(false);
      setEditingOrder(null);
      alert(t.success);
    } catch (error) {
      console.error('Error saving order:', error);
      alert(t.error);
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm(t.confirmDelete)) {
      try {
        await stockService.deleteOrder(id);
        await loadData();
      } catch (error) {
        console.error('Error deleting order:', error);
        alert(t.error);
      }
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'DRAFT': return <Clock className="h-4 w-4 text-gray-500" />;
      case 'PENDING': return <Clock className="h-4 w-4 text-yellow-500" />;
      case 'CONFIRMED': return <CheckCircle className="h-4 w-4 text-blue-500" />;
      case 'SHIPPED': return <Truck className="h-4 w-4 text-purple-500" />;
      case 'DELIVERED': return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'CANCELLED': return <XCircle className="h-4 w-4 text-red-500" />;
      default: return <Clock className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'DRAFT': return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
      case 'PENDING': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      case 'CONFIRMED': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      case 'SHIPPED': return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200';
      case 'DELIVERED': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'CANCELLED': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
    }
  };

  const pendingOrders = orders.filter(o => o.status === 'PENDING').length;
  const totalValue = orders.reduce((sum, order) => sum + order.totalAmount, 0);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-6">
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-gray-900 dark:text-white">{t.title}</h2>
        <p className="text-gray-600 dark:text-gray-400 mt-2">{t.subtitle}</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <div className="flex items-center">
            <ShoppingCart className="h-8 w-8 text-blue-600 mr-3" />
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">{t.totalOrders}</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{orders.length}</p>
            </div>
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <div className="flex items-center">
            <Clock className="h-8 w-8 text-yellow-600 mr-3" />
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">{t.pendingOrders}</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{pendingOrders}</p>
            </div>
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <div className="flex items-center">
            <DollarSign className="h-8 w-8 text-green-600 mr-3" />
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">{t.totalValue}</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {totalValue.toFixed(2)} dh
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 mb-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
          <div className="flex flex-col md:flex-row space-y-2 md:space-y-0 md:space-x-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder={t.search}
                className="pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">{t.all}</option>
              <option value="draft">{t.draft}</option>
              <option value="pending">{t.pending}</option>
              <option value="confirmed">{t.confirmed}</option>
              <option value="shipped">{t.shipped}</option>
              <option value="delivered">{t.delivered}</option>
              <option value="cancelled">{t.cancelled}</option>
            </select>
          </div>
          <div className="flex space-x-2">
            <button
              onClick={() => setShowAddModal(true)}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center"
            >
              <Plus size={16} className="mr-2" />
              {t.addOrder}
            </button>
          </div>
        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  {t.orderNumber}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  {t.supplier}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  {t.status}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  {t.orderDate}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  {t.expectedDate}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  {t.totalAmount}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  {t.actions}
                </th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              {filteredOrders.map((order) => (
                <tr key={order.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                    {order.orderNumber}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                    {order.supplier.name}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      {getStatusIcon(order.status)}
                      <span className={`ml-2 inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(order.status)}`}>
                        {t[order.status.toLowerCase() as keyof typeof t]}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-400">
                    {new Date(order.orderDate).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-400">
                    {order.expectedDate ? new Date(order.expectedDate).toLocaleDateString() : '-'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                    {order.totalAmount.toFixed(2)} dh
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex space-x-2">
                      <button
                        onClick={() => setSelectedOrder(order)}
                        className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300"
                      >
                        <Eye size={16} />
                      </button>
                      <button
                        onClick={() => {
                          setEditingOrder(order);
                          setShowAddModal(true);
                        }}
                        className="text-green-600 hover:text-green-900 dark:text-green-400 dark:hover:text-green-300"
                      >
                        <Edit size={16} />
                      </button>
                      <button
                        onClick={() => handleDelete(order.id)}
                        className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        {filteredOrders.length === 0 && (
          <div className="text-center py-8">
            <p className="text-gray-500 dark:text-gray-400">{t.noOrders}</p>
          </div>
        )}
      </div>

      {/* Add/Edit Modal */}
      {showAddModal && (
        <OrderModal
          order={editingOrder}
          suppliers={suppliers}
          products={products}
          onSave={handleSave}
          onCancel={() => {
            setShowAddModal(false);
            setEditingOrder(null);
          }}
          t={t}
        />
      )}

      {/* View Modal */}
      {selectedOrder && (
        <OrderViewModal
          order={selectedOrder}
          onClose={() => setSelectedOrder(null)}
          t={t}
        />
      )}
    </div>
  );
}

// Order Modal Component
function OrderModal({ order, suppliers, products, onSave, onCancel, t }: {
  order: Order | null;
  suppliers: Supplier[];
  products: Product[];
  onSave: (data: Partial<Order>) => void;
  onCancel: () => void;
  t: any;
}) {
  const [formData, setFormData] = useState({
    supplierId: order?.supplierId || '',
    status: order?.status || 'DRAFT',
    expectedDate: order?.expectedDate ? order.expectedDate.split('T')[0] : '',
    notes: order?.notes || '',
    orderItems: order?.orderItems || []
  });

  const [newItem, setNewItem] = useState({
    productId: '',
    quantity: 1,
    unitPrice: 0
  });

  const handleAddItem = () => {
    if (newItem.productId && newItem.quantity > 0) {
      const product = products.find(p => p.id === newItem.productId);
      const totalPrice = newItem.quantity * newItem.unitPrice;
      
      setFormData(prev => ({
        ...prev,
        orderItems: [...prev.orderItems, {
          id: Date.now().toString(),
          productId: newItem.productId,
          product: product!,
          quantity: newItem.quantity,
          unitPrice: newItem.unitPrice,
          totalPrice
        }]
      }));
      
      setNewItem({ productId: '', quantity: 1, unitPrice: 0 });
    }
  };

  const handleRemoveItem = (index: number) => {
    setFormData(prev => ({
      ...prev,
      orderItems: prev.orderItems.filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const totalAmount = formData.orderItems.reduce((sum, item) => sum + item.totalPrice, 0);
    onSave({ ...formData, totalAmount });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          {order ? t.editOrder : t.addOrder}
        </h3>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                {t.supplier}
              </label>
              <select
                value={formData.supplierId}
                onChange={(e) => setFormData(prev => ({ ...prev, supplierId: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
                required
              >
                <option value="">{t.supplier}</option>
                {suppliers.map(supplier => (
                  <option key={supplier.id} value={supplier.id}>
                    {supplier.name} ({supplier.code})
                  </option>
                ))}
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                {t.status}
              </label>
              <select
                value={formData.status}
                onChange={(e) => setFormData(prev => ({ ...prev, status: e.target.value as any }))}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
              >
                <option value="DRAFT">{t.draft}</option>
                <option value="PENDING">{t.pending}</option>
                <option value="CONFIRMED">{t.confirmed}</option>
                <option value="SHIPPED">{t.shipped}</option>
                <option value="DELIVERED">{t.delivered}</option>
                <option value="CANCELLED">{t.cancelled}</option>
              </select>
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              {t.expectedDate}
            </label>
            <input
              type="date"
              value={formData.expectedDate}
              onChange={(e) => setFormData(prev => ({ ...prev, expectedDate: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Notes
            </label>
            <textarea
              value={formData.notes}
              onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
              rows={3}
            />
          </div>

          {/* Order Items */}
          <div>
            <h4 className="text-md font-medium text-gray-900 dark:text-white mb-3">Order Items</h4>
            
            {/* Add New Item */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-2 mb-4">
              <select
                value={newItem.productId}
                onChange={(e) => {
                  const product = products.find(p => p.id === e.target.value);
                  setNewItem(prev => ({ 
                    ...prev, 
                    productId: e.target.value,
                    unitPrice: product?.price || 0
                  }));
                }}
                className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
              >
                <option value="">Select Product</option>
                {products.map(product => (
                  <option key={product.id} value={product.id}>
                    {product.name} ({product.code})
                  </option>
                ))}
              </select>
              
              <input
                type="number"
                placeholder="Quantity"
                value={newItem.quantity}
                onChange={(e) => setNewItem(prev => ({ ...prev, quantity: parseInt(e.target.value) || 0 }))}
                className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
                min="1"
              />
              
              <input
                type="number"
                placeholder="Unit Price"
                value={newItem.unitPrice}
                onChange={(e) => setNewItem(prev => ({ ...prev, unitPrice: parseFloat(e.target.value) || 0 }))}
                className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
                step="0.01"
                min="0"
              />
              
              <button
                type="button"
                onClick={handleAddItem}
                className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700"
              >
                Add Item
              </button>
            </div>

            {/* Items List */}
            <div className="space-y-2">
              {formData.orderItems.map((item, index) => (
                <div key={item.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <div className="flex-1">
                    <p className="font-medium">{item.product.name}</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {item.quantity} x {item.unitPrice.toFixed(2)} dh = {item.totalPrice.toFixed(2)} dh
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleRemoveItem(index)}
                    className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              ))}
            </div>

            {/* Total */}
            <div className="text-right mt-4">
              <p className="text-lg font-bold">
                Total: {formData.orderItems.reduce((sum, item) => sum + item.totalPrice, 0).toFixed(2)} dh
              </p>
            </div>
          </div>
        </form>
        
        <div className="flex justify-end space-x-2 mt-6">
          <button
            onClick={onCancel}
            className="px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700"
          >
            {t.cancel}
          </button>
          <button
            onClick={handleSubmit}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
          >
            {t.save}
          </button>
        </div>
      </div>
    </div>
  );
}

// Order View Modal Component
function OrderViewModal({ order, onClose, t }: {
  order: Order;
  onClose: () => void;
  t: any;
}) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          {t.viewOrder}
        </h3>
        
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                {t.orderNumber}
              </label>
              <p className="text-gray-900 dark:text-white">{order.orderNumber}</p>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                {t.supplier}
              </label>
              <p className="text-gray-900 dark:text-white">{order.supplier.name}</p>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                {t.status}
              </label>
              <p className="text-gray-900 dark:text-white">{t[order.status.toLowerCase() as keyof typeof t]}</p>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                {t.orderDate}
              </label>
              <p className="text-gray-900 dark:text-white">{new Date(order.orderDate).toLocaleDateString()}</p>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                {t.expectedDate}
              </label>
              <p className="text-gray-900 dark:text-white">
                {order.expectedDate ? new Date(order.expectedDate).toLocaleDateString() : '-'}
              </p>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                {t.totalAmount}
              </label>
              <p className="text-gray-900 dark:text-white">{order.totalAmount.toFixed(2)} dh</p>
            </div>
          </div>
          
          {order.notes && (
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Notes
              </label>
              <p className="text-gray-900 dark:text-white">{order.notes}</p>
            </div>
          )}

          {/* Order Items */}
          <div>
            <h4 className="text-md font-medium text-gray-900 dark:text-white mb-3">Order Items</h4>
            <div className="space-y-2">
              {order.orderItems.map((item) => (
                <div key={item.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <div>
                    <p className="font-medium">{item.product.name}</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {item.quantity} x {item.unitPrice.toFixed(2)} dh = {item.totalPrice.toFixed(2)} dh
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
        
        <div className="flex justify-end mt-6">
          <button
            onClick={onClose}
            className="px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700"
          >
            {t.cancel}
          </button>
        </div>
      </div>
    </div>
  );
} 