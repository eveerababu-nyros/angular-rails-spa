class Api::V1::AdminsController < Api::V1::BaseController
  before_filter :authenticate_admin!, :except => [:create, :show]

  respond :json

  def show
    render :json => {:info => "Current Admin", :admin => current_admin}, :status => 200
  end

  def create
    @user = Admin.new()
		@user.email = params[:user][:email]
		@user.password = params[:user][:password]
		@user.save
    if @user.valid?
      sign_in(@user)
      respond_with @user, :location => api_users_path
    else
      respond_with @user.errors, :location => api_users_path
    end
  end

  def update
    respond_with :api, Admin.update(current_admin.id, admin_params)
  end

  def destroy
    respond_with :api, Admin.find(current_admin.id).destroy
  end

  def index
    respond_with(@admins = Admin.all)
  end

end
