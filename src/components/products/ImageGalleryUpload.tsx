/**
 * ImageGalleryUpload Component
 * Supports 1 thumbnail + 4 additional gallery images
 * With drag-and-drop, preview, and reordering capabilities
 */

import React, { useState } from 'react';
import { Upload, Modal, message, Button, Space, Typography, Card, Row, Col, Empty } from 'antd';
import {
    PlusOutlined,
    DeleteOutlined,
    EyeOutlined,
    StarFilled,
    InboxOutlined,
} from '@ant-design/icons';
import type { UploadFile, RcFile } from 'antd/es/upload';
import type { ProductImage, ProductImageGallery } from '../../types/product.types';

const { Text } = Typography;
const { Dragger } = Upload;

interface ImageGalleryUploadProps {
    value?: ProductImageGallery;
    onChange?: (gallery: ProductImageGallery) => void;
    maxImages?: number;
    maxFileSize?: number; // in MB
    disabled?: boolean;
}

const ImageGalleryUpload: React.FC<ImageGalleryUploadProps> = ({
    value,
    onChange,
    maxImages = 5,
    maxFileSize = 5,
    disabled = false,
}) => {
    const [previewOpen, setPreviewOpen] = useState(false);
    const [previewImage, setPreviewImage] = useState('');
    const [previewTitle, setPreviewTitle] = useState('');

    // Convert ProductImage to UploadFile for Ant Design
    const toUploadFile = (image: ProductImage): UploadFile => ({
        uid: image.image_id || `img-${Date.now()}`,
        name: image.alt_text || 'image',
        status: 'done',
        url: image.url,
        thumbUrl: image.url,
    });

    // Handle preview
    const handlePreview = async (file: UploadFile) => {
        setPreviewImage(file.url || file.thumbUrl || '');
        setPreviewTitle(file.name || 'Preview');
        setPreviewOpen(true);
    };

    // Before upload validation
    const beforeUpload = (file: RcFile) => {
        // Check file type
        const isImage = file.type.startsWith('image/');
        if (!isImage) {
            message.error('You can only upload image files!');
            return false;
        }

        // Check file size
        const isLtSize = file.size / 1024 / 1024 < maxFileSize;
        if (!isLtSize) {
            message.error(`Image must be smaller than ${maxFileSize}MB!`);
            return false;
        }

        // Check max images
        const currentCount = (value?.thumbnail ? 1 : 0) + (value?.gallery?.length || 0);
        if (currentCount >= maxImages) {
            message.error(`Maximum ${maxImages} images allowed!`);
            return false;
        }

        return true;
    };

    // Handle file upload
    const customUpload = async (options: { file: RcFile; onSuccess?: (body: unknown) => void; onError?: (error: Error) => void }) => {
        const { file, onSuccess, onError } = options;
        
        try {
            // Create object URL for preview (in production, upload to server)
            const url = URL.createObjectURL(file);
            const hasThumbnail = value?.thumbnail !== null;
            
            const newImage: ProductImage = {
                image_id: `temp-${Date.now()}`,
                url: url,
                alt_text: file.name,
                is_primary: !hasThumbnail,
                sort_order: (value?.gallery?.length || 0) + 1,
            };

            // Update gallery
            const newGallery: ProductImageGallery = {
                thumbnail: value?.thumbnail || (newImage.is_primary ? newImage : null),
                gallery: hasThumbnail 
                    ? [...(value?.gallery || []), { ...newImage, is_primary: false }]
                    : (value?.gallery || []),
            };

            onChange?.(newGallery);
            onSuccess?.({ url });
            message.success('Image uploaded successfully');
        } catch (error) {
            onError?.(error as Error);
            message.error('Failed to upload image');
        }
    };

    // Handle remove
    const handleRemove = (file: UploadFile) => {
        if (disabled) return false;

        const isThumbnail = value?.thumbnail?.image_id === file.uid;
        
        let newGallery: ProductImageGallery;
        
        if (isThumbnail) {
            // If removing thumbnail, promote first gallery image to thumbnail
            const [newThumbnail, ...restGallery] = value?.gallery || [];
            newGallery = {
                thumbnail: newThumbnail ? { ...newThumbnail, is_primary: true } : null,
                gallery: restGallery,
            };
        } else {
            // Remove from gallery
            newGallery = {
                thumbnail: value?.thumbnail ?? null,
                gallery: value?.gallery?.filter((img) => img.image_id !== file.uid) || [],
            };
        }

        onChange?.(newGallery);
        message.success('Image removed');
        return true;
    };

    // Set as thumbnail
    const setAsThumbnail = (imageId: string) => {
        if (disabled || !value) return;

        const targetImage = value.gallery?.find((img) => img.image_id === imageId);
        if (!targetImage) return;

        // Swap thumbnail with target
        const newGallery: ProductImageGallery = {
            thumbnail: { ...targetImage, is_primary: true },
            gallery: [
                ...(value.thumbnail ? [{ ...value.thumbnail, is_primary: false }] : []),
                ...value.gallery.filter((img) => img.image_id !== imageId),
            ].map((img, idx) => ({ ...img, sort_order: idx + 1 })),
        };

        onChange?.(newGallery);
        message.success('Thumbnail updated');
    };

    // Custom render for upload list
    const uploadButton = (
        <div>
            <PlusOutlined />
            <div style={{ marginTop: 8 }}>Upload</div>
        </div>
    );

    // Get current count
    const currentCount = (value?.thumbnail ? 1 : 0) + (value?.gallery?.length || 0);
    const canAddMore = currentCount < maxImages;

    return (
        <div>
            {/* Header */}
            <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Space>
                    <Text strong>Product Images</Text>
                    <Text type="secondary">({currentCount}/{maxImages})</Text>
                </Space>
                <Text type="secondary" style={{ fontSize: 12 }}>
                    First image will be the thumbnail. Max {maxFileSize}MB per image.
                </Text>
            </div>

            {/* Thumbnail Section */}
            <Card size="small" title="Thumbnail" style={{ marginBottom: 16 }}>
                {value?.thumbnail ? (
                    <div style={{ position: 'relative', display: 'inline-block' }}>
                        <img
                            src={value.thumbnail.url}
                            alt={value.thumbnail.alt_text}
                            style={{ 
                                width: 150, 
                                height: 150, 
                                objectFit: 'cover', 
                                borderRadius: 8,
                                border: '3px solid #1890ff',
                            }}
                        />
                        <div style={{ 
                            position: 'absolute', 
                            top: -8, 
                            right: -8, 
                            background: '#1890ff', 
                            borderRadius: '50%',
                            padding: 4,
                        }}>
                            <StarFilled style={{ color: '#fff', fontSize: 16 }} />
                        </div>
                        {!disabled && (
                            <div style={{ 
                                position: 'absolute', 
                                bottom: 0, 
                                left: 0, 
                                right: 0, 
                                background: 'rgba(0,0,0,0.5)',
                                padding: '4px 0',
                                borderRadius: '0 0 8px 8px',
                                textAlign: 'center',
                            }}>
                                <Space>
                                    <Button 
                                        type="text" 
                                        size="small" 
                                        icon={<EyeOutlined style={{ color: '#fff' }} />}
                                        onClick={() => handlePreview(toUploadFile(value.thumbnail!))}
                                    />
                                    <Button 
                                        type="text" 
                                        size="small" 
                                        danger
                                        icon={<DeleteOutlined style={{ color: '#ff4d4f' }} />}
                                        onClick={() => handleRemove(toUploadFile(value.thumbnail!))}
                                    />
                                </Space>
                            </div>
                        )}
                    </div>
                ) : (
                    <Upload
                        listType="picture-card"
                        showUploadList={false}
                        beforeUpload={beforeUpload}
                        customRequest={(options) => customUpload(options as unknown as { file: RcFile; onSuccess?: (body: unknown) => void; onError?: (error: Error) => void })}
                        disabled={disabled}
                    >
                        {uploadButton}
                    </Upload>
                )}
            </Card>

            {/* Gallery Section */}
            <Card size="small" title="Additional Images" style={{ marginBottom: 16 }}>
                <Row gutter={[16, 16]}>
                    {value?.gallery?.map((image) => (
                        <Col key={image.image_id || image.url}>
                            <div style={{ position: 'relative', display: 'inline-block' }}>
                                <img
                                    src={image.url}
                                    alt={image.alt_text}
                                    style={{ 
                                        width: 100, 
                                        height: 100, 
                                        objectFit: 'cover', 
                                        borderRadius: 8,
                                        border: '1px solid #d9d9d9',
                                    }}
                                />
                                {!disabled && (
                                    <div style={{ 
                                        position: 'absolute', 
                                        bottom: 0, 
                                        left: 0, 
                                        right: 0, 
                                        background: 'rgba(0,0,0,0.5)',
                                        padding: '4px 0',
                                        borderRadius: '0 0 8px 8px',
                                        textAlign: 'center',
                                    }}>
                                        <Space size={2}>
                                            <Button 
                                                type="text" 
                                                size="small" 
                                                icon={<StarFilled style={{ color: '#faad14' }} />}
                                                onClick={() => setAsThumbnail(image.image_id || '')}
                                                title="Set as thumbnail"
                                            />
                                            <Button 
                                                type="text" 
                                                size="small" 
                                                icon={<EyeOutlined style={{ color: '#fff' }} />}
                                                onClick={() => handlePreview(toUploadFile(image))}
                                            />
                                            <Button 
                                                type="text" 
                                                size="small" 
                                                danger
                                                icon={<DeleteOutlined style={{ color: '#ff4d4f' }} />}
                                                onClick={() => handleRemove(toUploadFile(image))}
                                            />
                                        </Space>
                                    </div>
                                )}
                            </div>
                        </Col>
                    ))}
                    
                    {/* Add more button */}
                    {canAddMore && value?.thumbnail && (
                        <Col>
                            <Upload
                                listType="picture-card"
                                showUploadList={false}
                                beforeUpload={beforeUpload}
                                customRequest={(options) => customUpload(options as unknown as { file: RcFile; onSuccess?: (body: unknown) => void; onError?: (error: Error) => void })}
                                disabled={disabled}
                            >
                                <div style={{ width: 100, height: 100, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>
                                    <PlusOutlined />
                                    <div style={{ marginTop: 8, fontSize: 12 }}>Add</div>
                                </div>
                            </Upload>
                        </Col>
                    )}

                    {!value?.gallery?.length && !value?.thumbnail && (
                        <Col span={24}>
                            <Empty 
                                description="No gallery images. Add a thumbnail first."
                                style={{ padding: '20px 0' }}
                            />
                        </Col>
                    )}
                </Row>
            </Card>

            {/* Drag and Drop Zone */}
            {canAddMore && (
                <Dragger
                    multiple
                    showUploadList={false}
                    beforeUpload={beforeUpload}
                    customRequest={(options) => customUpload(options as unknown as { file: RcFile; onSuccess?: (body: unknown) => void; onError?: (error: Error) => void })}
                    disabled={disabled}
                    style={{ marginTop: 16 }}
                >
                    <p className="ant-upload-drag-icon">
                        <InboxOutlined />
                    </p>
                    <p className="ant-upload-text">Click or drag images to upload</p>
                    <p className="ant-upload-hint">
                        Support for single or bulk upload. Max {maxFileSize}MB per file.
                    </p>
                </Dragger>
            )}

            {/* Preview Modal */}
            <Modal
                open={previewOpen}
                title={previewTitle}
                footer={null}
                onCancel={() => setPreviewOpen(false)}
            >
                <img alt="preview" style={{ width: '100%' }} src={previewImage} />
            </Modal>
        </div>
    );
};

export default ImageGalleryUpload;
