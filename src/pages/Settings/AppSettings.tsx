import React, { useState, useCallback, useRef } from 'react';
import {
    Card,
    Form,
    Upload,
    Button,
    message,
    Progress,
    Alert,
    Space,
    Typography,
    Divider,
} from 'antd';
import {
    UploadOutlined,
    VideoCameraOutlined,
    DeleteOutlined,
    CheckCircleOutlined,
    WarningOutlined,
} from '@ant-design/icons';
import type { UploadProps } from 'antd/es/upload/interface';
import { useAuthStore } from '../../store/authStore';

const { Title, Text, Paragraph } = Typography;

// ============================================================================
// SPLASH VIDEO CONFIGURATION CONSTANTS
// ============================================================================
const SPLASH_VIDEO_CONFIG = {
    MAX_DURATION_SECONDS: 4.0,      // Maximum video duration: 4 seconds
    MAX_FILE_SIZE_MB: 5,            // Maximum file size: 5MB
    MAX_FILE_SIZE_BYTES: 5 * 1024 * 1024, // 5MB in bytes
    ACCEPTED_FORMATS: ['video/mp4'],
    ACCEPTED_EXTENSIONS: ['.mp4'],
} as const;

interface VideoValidationResult {
    isValid: boolean;
    duration?: number;
    fileSize?: number;
    errors: string[];
}

interface SplashVideoData {
    url: string | null;
    uploadedAt: string | null;
    duration: number | null;
    fileSize: number | null;
}

const AppSettings: React.FC = () => {
    const { user } = useAuthStore();
    const [form] = Form.useForm();
    const [uploading, setUploading] = useState(false);
    const [validating, setValidating] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);
    const [currentVideo, setCurrentVideo] = useState<SplashVideoData | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const [validationResult, setValidationResult] = useState<VideoValidationResult | null>(null);
    const videoRef = useRef<HTMLVideoElement>(null);

    // Check if user is Super Admin
    const isSuperAdmin = user?.role === 'super_admin';

    /**
     * Validate video file duration and size
     * Client-side validation before upload
     */
    const validateVideoFile = useCallback((file: File): Promise<VideoValidationResult> => {
        return new Promise((resolve) => {
            const errors: string[] = [];
            let duration = 0;

            // 1. Validate file type
            if (!(SPLASH_VIDEO_CONFIG.ACCEPTED_FORMATS as readonly string[]).includes(file.type)) {
                errors.push('Invalid file format. Please upload an MP4 video.');
            }

            // 2. Validate file size (5MB max)
            if (file.size > SPLASH_VIDEO_CONFIG.MAX_FILE_SIZE_BYTES) {
                const sizeInMB = (file.size / (1024 * 1024)).toFixed(2);
                errors.push(
                    `File size (${sizeInMB}MB) exceeds the maximum limit of ${SPLASH_VIDEO_CONFIG.MAX_FILE_SIZE_MB}MB.`
                );
            }

            // 3. Validate video duration (4 seconds max)
            const video = document.createElement('video');
            video.preload = 'metadata';

            video.onloadedmetadata = () => {
                window.URL.revokeObjectURL(video.src);
                duration = video.duration;

                if (duration > SPLASH_VIDEO_CONFIG.MAX_DURATION_SECONDS) {
                    errors.push(
                        `Video duration (${duration.toFixed(2)}s) exceeds the maximum of ${SPLASH_VIDEO_CONFIG.MAX_DURATION_SECONDS} seconds.`
                    );
                }

                resolve({
                    isValid: errors.length === 0,
                    duration,
                    fileSize: file.size,
                    errors,
                });
            };

            video.onerror = () => {
                errors.push('Unable to read video metadata. Please ensure the file is a valid MP4.');
                resolve({
                    isValid: false,
                    errors,
                });
            };

            video.src = URL.createObjectURL(file);
        });
    }, []);

    /**
     * Handle file selection and validation before upload
     */
    const handleBeforeUpload: UploadProps['beforeUpload'] = async (file) => {
        setValidating(true);
        setValidationResult(null);

        try {
            const result = await validateVideoFile(file);
            setValidationResult(result);

            if (!result.isValid) {
                result.errors.forEach((error) => message.error(error));
                setValidating(false);
                return false;
            }

            // Create preview URL
            const url = URL.createObjectURL(file);
            setPreviewUrl(url);
            
            message.success(
                `Video validated: ${result.duration?.toFixed(2)}s duration, ${(file.size / (1024 * 1024)).toFixed(2)}MB`
            );
        } catch (error) {
            message.error('Failed to validate video file');
            setValidating(false);
            return false;
        }

        setValidating(false);
        return false; // Prevent auto upload, we'll handle it manually
    };

    /**
     * Upload validated video to server
     */
    const handleUpload = async () => {
        const fileList = form.getFieldValue('splashVideo');
        if (!fileList || fileList.length === 0) {
            message.error('Please select a video file first');
            return;
        }

        const file = fileList[0].originFileObj;
        if (!file) {
            message.error('Invalid file');
            return;
        }

        // Re-validate before upload
        const validation = await validateVideoFile(file);
        if (!validation.isValid) {
            validation.errors.forEach((error) => message.error(error));
            return;
        }

        setUploading(true);
        setUploadProgress(0);

        const formData = new FormData();
        formData.append('video', file);
        formData.append('duration', String(validation.duration));

        try {
            const response = await fetch('/api/v1/admin/settings/splash-video', {
                method: 'PUT',
                headers: {
                    Authorization: `Bearer ${localStorage.getItem('adminToken')}`,
                },
                body: formData,
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Upload failed');
            }

            const data = await response.json();
            
            setCurrentVideo({
                url: data.url,
                uploadedAt: new Date().toISOString(),
                duration: validation.duration || null,
                fileSize: file.size,
            });

            message.success('Splash video uploaded successfully!');
            form.resetFields(['splashVideo']);
            setPreviewUrl(null);
            setValidationResult(null);
        } catch (error: any) {
            message.error(error.message || 'Failed to upload splash video');
        } finally {
            setUploading(false);
            setUploadProgress(0);
        }
    };

    /**
     * Delete current splash video
     */
    const handleDelete = async () => {
        try {
            const response = await fetch('/api/v1/admin/settings/splash-video', {
                method: 'DELETE',
                headers: {
                    Authorization: `Bearer ${localStorage.getItem('adminToken')}`,
                },
            });

            if (!response.ok) {
                throw new Error('Failed to delete splash video');
            }

            setCurrentVideo(null);
            message.success('Splash video removed successfully');
        } catch (error) {
            message.error('Failed to delete splash video');
        }
    };

    /**
     * Clean up preview URL on unmount
     */
    React.useEffect(() => {
        return () => {
            if (previewUrl) {
                URL.revokeObjectURL(previewUrl);
            }
        };
    }, [previewUrl]);

    if (!isSuperAdmin) {
        return (
            <Alert
                message="Access Denied"
                description="Only Super Admins can manage app settings."
                type="error"
                showIcon
            />
        );
    }

    return (
        <div style={{ maxWidth: 800, margin: '0 auto' }}>
            <Title level={3}>
                <VideoCameraOutlined style={{ marginRight: 8 }} />
                User App Settings
            </Title>

            <Paragraph type="secondary">
                Configure settings for the FreshCart mobile application.
            </Paragraph>

            <Divider />

            {/* Dynamic Splash Video Section */}
            <Card 
                title="Dynamic Splash Video" 
                style={{ marginBottom: 24 }}
                extra={
                    currentVideo && (
                        <Button 
                            danger 
                            icon={<DeleteOutlined />}
                            onClick={handleDelete}
                        >
                            Remove Video
                        </Button>
                    )
                }
            >
                {/* Instructions */}
                <Alert
                    message="Splash Video Requirements"
                    description={
                        <ul style={{ margin: 0, paddingLeft: 20 }}>
                            <li>
                                <strong>Duration:</strong> Maximum {SPLASH_VIDEO_CONFIG.MAX_DURATION_SECONDS} seconds
                            </li>
                            <li>
                                <strong>File Size:</strong> Maximum {SPLASH_VIDEO_CONFIG.MAX_FILE_SIZE_MB}MB
                            </li>
                            <li>
                                <strong>Format:</strong> MP4 only
                            </li>
                            <li>
                                <strong>Recommended:</strong> 1080x1920 (vertical) or 1920x1080 (horizontal)
                            </li>
                        </ul>
                    }
                    type="info"
                    showIcon
                    icon={<VideoCameraOutlined />}
                    style={{ marginBottom: 24 }}
                />

                {/* Prominent Instruction */}
                <Alert
                    message={
                        <Space>
                            <UploadOutlined />
                            <Text strong>
                                Please upload a 4-second MP4 video for the app splash screen.
                            </Text>
                        </Space>
                    }
                    type="warning"
                    style={{ marginBottom: 24 }}
                />

                {/* Current Video Preview */}
                {currentVideo && currentVideo.url && (
                    <Card 
                        type="inner" 
                        title="Current Splash Video" 
                        style={{ marginBottom: 24 }}
                    >
                        <video
                            ref={videoRef}
                            src={currentVideo.url}
                            controls
                            style={{ 
                                maxWidth: '100%', 
                                maxHeight: 300,
                                borderRadius: 8,
                            }}
                        />
                        <div style={{ marginTop: 12 }}>
                            <Space direction="vertical" size={4}>
                                <Text type="secondary">
                                    Duration: {currentVideo.duration?.toFixed(2)}s
                                </Text>
                                <Text type="secondary">
                                    Size: {((currentVideo.fileSize || 0) / (1024 * 1024)).toFixed(2)}MB
                                </Text>
                                <Text type="secondary">
                                    Uploaded: {currentVideo.uploadedAt ? new Date(currentVideo.uploadedAt).toLocaleString() : 'N/A'}
                                </Text>
                            </Space>
                        </div>
                    </Card>
                )}

                {/* Upload Form */}
                <Form form={form} layout="vertical">
                    <Form.Item
                        name="splashVideo"
                        valuePropName="fileList"
                        getValueFromEvent={(e) => e?.fileList}
                        rules={[
                            {
                                validator: async (_, fileList) => {
                                    if (!fileList || fileList.length === 0) {
                                        return Promise.resolve();
                                    }
                                    // Additional validation handled in beforeUpload
                                    return Promise.resolve();
                                },
                            },
                        ]}
                    >
                        <Upload
                            accept={SPLASH_VIDEO_CONFIG.ACCEPTED_EXTENSIONS.join(',')}
                            maxCount={1}
                            beforeUpload={handleBeforeUpload}
                            onRemove={() => {
                                setPreviewUrl(null);
                                setValidationResult(null);
                            }}
                            listType="picture"
                        >
                            <Button 
                                icon={<UploadOutlined />} 
                                disabled={uploading || validating}
                            >
                                {validating ? 'Validating...' : 'Select Video'}
                            </Button>
                        </Upload>
                    </Form.Item>

                    {/* Validation Result */}
                    {validationResult && (
                        <div style={{ marginBottom: 16 }}>
                            {validationResult.isValid ? (
                                <Alert
                                    message="Video Validated Successfully"
                                    description={
                                        <Space direction="vertical" size={4}>
                                            <Text>
                                                <CheckCircleOutlined style={{ color: '#52c41a', marginRight: 8 }} />
                                                Duration: {validationResult.duration?.toFixed(2)} seconds
                                            </Text>
                                            <Text>
                                                <CheckCircleOutlined style={{ color: '#52c41a', marginRight: 8 }} />
                                                Size: {((validationResult.fileSize || 0) / (1024 * 1024)).toFixed(2)} MB
                                            </Text>
                                        </Space>
                                    }
                                    type="success"
                                    showIcon
                                />
                            ) : (
                                <Alert
                                    message="Validation Failed"
                                    description={
                                        <ul style={{ margin: 0, paddingLeft: 20 }}>
                                            {validationResult.errors.map((error, index) => (
                                                <li key={index}>
                                                    <WarningOutlined style={{ color: '#ff4d4f', marginRight: 8 }} />
                                                    {error}
                                                </li>
                                            ))}
                                        </ul>
                                    }
                                    type="error"
                                    showIcon
                                />
                            )}
                        </div>
                    )}

                    {/* Preview */}
                    {previewUrl && validationResult?.isValid && (
                        <Card type="inner" title="Preview" style={{ marginBottom: 16 }}>
                            <video
                                src={previewUrl}
                                controls
                                style={{ 
                                    maxWidth: '100%', 
                                    maxHeight: 250,
                                    borderRadius: 8,
                                }}
                            />
                        </Card>
                    )}

                    {/* Upload Progress */}
                    {uploading && (
                        <Progress 
                            percent={uploadProgress} 
                            status="active"
                            style={{ marginBottom: 16 }}
                        />
                    )}

                    {/* Upload Button */}
                    <Form.Item>
                        <Button
                            type="primary"
                            icon={<UploadOutlined />}
                            onClick={handleUpload}
                            loading={uploading}
                            disabled={!validationResult?.isValid || validating}
                        >
                            {uploading ? 'Uploading...' : 'Upload Splash Video'}
                        </Button>
                    </Form.Item>
                </Form>
            </Card>

            {/* Additional App Settings (Placeholder) */}
            <Card title="Additional App Settings" style={{ marginBottom: 24 }}>
                <Alert
                    message="Coming Soon"
                    description="Additional mobile app settings will be available in future updates."
                    type="info"
                    showIcon
                />
            </Card>
        </div>
    );
};

export default AppSettings;
