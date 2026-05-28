import React, { useState, useEffect } from 'react';
import { Form, Input, InputNumber, Select, Button, Card, Upload, message, Switch } from 'antd';
import { UploadOutlined, ArrowLeftOutlined } from '@ant-design/icons';
import { useNavigate, useParams } from 'react-router-dom';
import { productApi } from '../../api/products.api';
import type { CreateProductDTO } from '../../api/products.api';
import type { UploadFile } from 'antd/es/upload/interface';

const { TextArea } = Input;
const { Option } = Select;

const ProductForm: React.FC = () => {
    const navigate = useNavigate();
    const { id } = useParams();
    const [form] = Form.useForm();
    const [loading, setLoading] = useState(false);
    const [fileList, setFileList] = useState<UploadFile[]>([]);

    const isEdit = !!id;

    useEffect(() => {
        if (isEdit) {
            fetchProduct();
        }
    }, [id]);

    const fetchProduct = async () => {
        try {
            setLoading(true);
            const product = await productApi.getById(id!);
            form.setFieldsValue({
                name: product.name,
                description: product.description,
                price: product.price,
                compareAtPrice: product.compareAtPrice,
                category: product.category,
                stock: product.stock,
                sku: product.sku,
                status: product.status,
                tags: product.tags?.join(', '),
            });

            // Set images
            if (product.images && product.images.length > 0) {
                const files = product.images.map((url, index) => ({
                    uid: `-${index}`,
                    name: `image-${index}.jpg`,
                    status: 'done' as const,
                    url: url,
                }));
                setFileList(files);
            }
        } catch (error) {
            message.error('Failed to load product');
        } finally {
            setLoading(false);
        }
    };

    const onFinish = async (values: any) => {
        try {
            setLoading(true);

            const productData: CreateProductDTO = {
                name: values.name,
                description: values.description,
                price: values.price,
                compareAtPrice: values.compareAtPrice,
                category: values.category,
                stock: values.stock,
                sku: values.sku,
                status: values.status,
                tags: values.tags ? values.tags.split(',').map((t: string) => t.trim()) : [],
                images: fileList.map(file => file.url || file.response?.url || ''),
            };

            if (isEdit) {
                await productApi.update(id!, productData);
                message.success('Product updated successfully');
            } else {
                await productApi.create(productData);
                message.success('Product created successfully');
            }

            navigate('/products');
        } catch (error: any) {
            message.error(error.response?.data?.message || 'Failed to save product');
        } finally {
            setLoading(false);
        }
    };

    const handleUploadChange = ({ fileList: newFileList }: any) => {
        setFileList(newFileList);
    };

    return (
        <div>
            <Button
                icon={<ArrowLeftOutlined />}
                onClick={() => navigate('/products')}
                style={{ marginBottom: 16 }}
            >
                Back to Products
            </Button>

            <Card title={isEdit ? 'Edit Product' : 'Add New Product'}>
                <Form
                    form={form}
                    layout="vertical"
                    onFinish={onFinish}
                    initialValues={{
                        status: 'active',
                        stock: 0,
                    }}
                >
                    <Form.Item
                        label="Product Name"
                        name="name"
                        rules={[{ required: true, message: 'Please enter product name' }]}
                    >
                        <Input placeholder="e.g., Organic Milk" />
                    </Form.Item>

                    <Form.Item
                        label="Description"
                        name="description"
                        rules={[{ required: true, message: 'Please enter description' }]}
                    >
                        <TextArea rows={4} placeholder="Describe the product..." />
                    </Form.Item>

                    <Form.Item
                        label="SKU"
                        name="sku"
                        rules={[{ required: true, message: 'Please enter SKU' }]}
                    >
                        <Input placeholder="e.g., MILK-ORG-001" />
                    </Form.Item>

                    <Form.Item
                        label="Category"
                        name="category"
                        rules={[{ required: true, message: 'Please select category' }]}
                    >
                        <Select placeholder="Select category">
                            <Option value="Dairy">Dairy</Option>
                            <Option value="Bakery">Bakery</Option>
                            <Option value="Fruits">Fruits</Option>
                            <Option value="Vegetables">Vegetables</Option>
                            <Option value="Meat">Meat</Option>
                            <Option value="Beverages">Beverages</Option>
                            <Option value="Snacks">Snacks</Option>
                        </Select>
                    </Form.Item>

                    <Form.Item
                        label="Price"
                        name="price"
                        rules={[{ required: true, message: 'Please enter price' }]}
                    >
                        <InputNumber
                            prefix="$"
                            min={0}
                            step={0.01}
                            style={{ width: '100%' }}
                            placeholder="0.00"
                        />
                    </Form.Item>

                    <Form.Item
                        label="Compare at Price (Optional)"
                        name="compareAtPrice"
                    >
                        <InputNumber
                            prefix="$"
                            min={0}
                            step={0.01}
                            style={{ width: '100%' }}
                            placeholder="0.00"
                        />
                    </Form.Item>

                    <Form.Item
                        label="Stock Quantity"
                        name="stock"
                        rules={[{ required: true, message: 'Please enter stock quantity' }]}
                    >
                        <InputNumber
                            min={0}
                            style={{ width: '100%' }}
                            placeholder="0"
                        />
                    </Form.Item>

                    <Form.Item
                        label="Tags (comma-separated)"
                        name="tags"
                    >
                        <Input placeholder="e.g., organic, fresh, local" />
                    </Form.Item>

                    <Form.Item
                        label="Status"
                        name="status"
                        valuePropName="checked"
                    >
                        <Switch
                            checkedChildren="Active"
                            unCheckedChildren="Inactive"
                            checked={form.getFieldValue('status') === 'active'}
                            onChange={(checked) => form.setFieldValue('status', checked ? 'active' : 'inactive')}
                        />
                    </Form.Item>

                    <Form.Item label="Product Images">
                        <Upload
                            listType="picture-card"
                            fileList={fileList}
                            onChange={handleUploadChange}
                            beforeUpload={() => false}
                            maxCount={5}
                        >
                            {fileList.length < 5 && (
                                <div>
                                    <UploadOutlined />
                                    <div style={{ marginTop: 8 }}>Upload</div>
                                </div>
                            )}
                        </Upload>
                        <div style={{ marginTop: 8, color: '#999', fontSize: 12 }}>
                            Maximum 5 images. Recommended size: 800x800px
                        </div>
                    </Form.Item>

                    <Form.Item>
                        <Button type="primary" htmlType="submit" loading={loading} size="large">
                            {isEdit ? 'Update Product' : 'Create Product'}
                        </Button>
                        <Button
                            style={{ marginLeft: 8 }}
                            onClick={() => navigate('/products')}
                            size="large"
                        >
                            Cancel
                        </Button>
                    </Form.Item>
                </Form>
            </Card>
        </div>
    );
};

export default ProductForm;
